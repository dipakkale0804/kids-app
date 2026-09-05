import { NextResponse } from "next/server";
import { getApps } from "firebase-admin/app";
import Razorpay from "razorpay";

export async function GET() {
  return NextResponse.json({ success: true, message: "Imports work!", apps: getApps().length, rzp: typeof Razorpay });
}
