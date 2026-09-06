import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decodedToken;
    try {
      const adminAuth = getAdminAuth();
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, currency } = await req.json();

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // If valid, calculate expiration date and update user profile in Firestore
    try {
      const adminDb = getAdminDb();
      const profileRef = adminDb.collection("profiles").doc(decodedToken.uid);
      
      // Get the profile first to check for referral code
      const profileDoc = await profileRef.get();
      const profileData = profileDoc.data();

      const activatedAt = new Date();
      const isYearly = plan === "yearly";
      const daysToAdd = isYearly ? 365 : 30;
      const expiresAt = new Date(activatedAt.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

      await profileRef.set({
        is_premium: true,
        isPremium: true,
        plan: plan || "monthly",
        currency: currency || "INR",
        lastPaymentId: razorpay_payment_id,
        lastOrderId: razorpay_order_id,
        premiumActivatedAt: activatedAt.toISOString(),
        premiumExpiresAt: expiresAt,
      }, { merge: true });

      // Log the sale for the influencer if they were referred
      if (profileData && profileData.referred_by) {
        await adminDb.collection("referral_sales").add({
          influencer: profileData.referred_by,
          userId: decodedToken.uid,
          razorpay_order_id,
          razorpay_payment_id,
          currency: currency || "INR",
          plan: plan || "monthly",
          date: activatedAt.toISOString()
        });
      }

      return NextResponse.json({ 
        success: true, 
        premiumExpiresAt: expiresAt,
        plan: plan || "monthly"
      }, { status: 200 });
    } catch (error) {
      console.error("Failed to update premium status:", error);
      return NextResponse.json({ error: "Failed to update premium status in database." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
