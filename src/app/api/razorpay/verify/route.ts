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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // If valid, update the user profile in Firestore to be premium
    try {
      const adminDb = getAdminDb();
      await adminDb.collection("profiles").doc(decodedToken.uid).update({
        is_premium: true
      });
    } catch (error) {
      console.error("Failed to update premium status:", error);
      return NextResponse.json({ error: "Failed to update premium status in database." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
