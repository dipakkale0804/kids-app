import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: 1999 * 100, // Amount is in currency subunits. (e.g. 199900 paise = 1999 INR, or cents if USD is enabled)
      currency: "INR", // Can be changed to USD in Razorpay dashboard for international
      receipt: `receipt_order_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        email: email
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order.' },
      { status: 500 }
    );
  }
}
