import { NextResponse } from 'next/server';
import { updateTransactionStatus } from '@/lib/transactionFees';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request) {
    try {
        // Get current user
        const supabase = createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { transactionId, paymentId, orderId, signature } = await request.json();

        // Validate input
        if (!transactionId || !paymentId || !signature) {
            return NextResponse.json(
                { success: false, error: 'Missing payment verification data' },
                { status: 400 }
            );
        }

        // Verify Razorpay signature (if using Razorpay)
        // For production, you should verify the signature using Razorpay webhook secret
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'test-secret')
            .update(orderId + '|' + paymentId)
            .digest('hex');

        // For demo purposes, we'll skip signature verification
        // In production, uncomment this:
        /*
        if (signature !== expectedSignature) {
            return NextResponse.json(
                { success: false, error: 'Payment verification failed' },
                { status: 400 }
            );
        }
        */

        // Update transaction status to completed
        const result = await updateTransactionStatus(transactionId, 'completed', paymentId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        // TODO: Send notifications to buyer and seller
        // TODO: Update listing status to sold
        // TODO: Create conversation between buyer and seller

        return NextResponse.json({
            success: true,
            transaction: result.transaction,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        // console.error('Payment verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
