import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminAuth } from "@/lib/firebase/admin";

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

    // Parse the requested plan and currency
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const { plan = "yearly", currency = "INR" } = body;
    const selectedCurrency = String(currency).toUpperCase() === "USD" ? "USD" : "INR";

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Subunit calculation:
    // USD: 100 cents per dollar ($9.99 = 999 cents, $59.99 = 5999 cents)
    // INR: 100 paise per rupee (₹199 = 19900 paise, ₹999 = 99900 paise)
    let amountInSubunits: number;
    if (selectedCurrency === "USD") {
      amountInSubunits = plan === "monthly" ? 999 : 5999;
    } else {
      amountInSubunits = plan === "monthly" ? 19900 : 99900;
    }

    const options = {
      amount: amountInSubunits,
      currency: selectedCurrency,
      receipt: `receipt_${decodedToken.uid.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: decodedToken.uid,
        plan,
        currency: selectedCurrency,
      },
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
