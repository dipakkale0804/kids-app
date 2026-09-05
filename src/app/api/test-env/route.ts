import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import Razorpay from "razorpay";

export async function GET() {
  try {
    let result: any = { status: "running 2" };
    
    try {
      result.envKeys = Object.keys(process.env).filter(k => k.includes("FIREBASE") || k.includes("RAZOR"));
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
      const auth = getAdminAuth();
      result.adminAuthLoaded = !!auth;
    } catch (e: any) {
      result.adminAuthError = e.message || String(e);
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

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ outerError: error.message || String(error) }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
