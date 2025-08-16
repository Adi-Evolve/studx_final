import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { amount, currency = 'INR', receipt = 'order_rcptid_11' } = body;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
    };
    // console.log('[Razorpay] Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    // console.log('[Razorpay] Order response:', order);
    return NextResponse.json(order);
  } catch (error) {
    // Enhanced error logging
    // console.error('[Razorpay] Error creating order:', error);
    if (error.stack) {
      // console.error('[Razorpay] Error stack:', error.stack);
    }
    if (error.response) {
      // console.error('[Razorpay] Error response:', error.response);
    }
    // Log environment variable presence (not values)
    // console.log('[Razorpay] ENV KEYS SET:', {
    //   RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
    //   RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
    // });
    // Return detailed error info
    return NextResponse.json({
      error: error.message || 'Unknown error',
      stack: error.stack || null,
      response: error.response || null,
      name: error.name || null,
      code: error.code || null,
    }, { status: 500 });
  }
}
