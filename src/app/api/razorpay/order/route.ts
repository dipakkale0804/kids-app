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

    // Parse the requested plan
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const { plan = "yearly" } = body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Set amount based on plan
    const amount = plan === "monthly" ? 1 : 2;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${decodedToken.uid.substring(0, 8)}_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
