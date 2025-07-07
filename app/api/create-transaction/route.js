import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/transactionFees';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

        const { listingId, listingType, amount, sellerId, paymentMethod } = await request.json();

        // Validate input
        if (!listingId || !listingType || !amount || !sellerId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Prevent self-purchase
        if (user.id === sellerId) {
            return NextResponse.json(
                { success: false, error: 'Cannot purchase your own item' },
                { status: 400 }
            );
        }

        // Create transaction record
        const result = await createTransaction({
            buyerId: user.id,
            sellerId,
            listingId,
            listingType,
            amount,
            paymentMethod: paymentMethod || 'razorpay'
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            transaction: result.transaction,
            fees: result.fees
        });

    } catch (error) {
        console.error('Transaction creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
