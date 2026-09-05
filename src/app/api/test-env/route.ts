import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import Razorpay from "razorpay";

export async function GET() {
  try {
    let result: any = { status: "running" };
    
    try {
      result.firebaseKeyExists = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      result.razorpayKeyExists = !!process.env.RAZORPAY_KEY_ID;
    } catch (e: any) {
      result.envError = e.message;
    }

    try {
      const db = getAdminDb();
      result.adminDbLoaded = !!db;
    } catch (e: any) {
      result.adminError = e.message || String(e);
    }

    try {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "test",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "test"
      });
      result.razorpayLoaded = !!rzp;
    } catch (e: any) {
      result.razorpayError = e.message || String(e);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
