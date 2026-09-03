import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Razorpay requires this exact cryptographic string to verify the payment is authentic
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is legit! Update the user's profile to Premium in Firebase
      if (userId) {
        await adminDb.collection('profiles').doc(userId).set({
          isPremium: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment.' }, { status: 500 });
  }
}
