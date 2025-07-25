// Transaction Fee System - Core Implementation
// Remove 'use server' since this contains utility functions that don't need to be server actions

import { createClient } from '@supabase/supabase-js';

// Create Supabase client only when needed, with proper environment handling
function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Platform fee configuration
const PLATFORM_FEE_CONFIG = {
    tiers: [
        { min: 0, max: 500, feePercent: 2.0 },
        { min: 501, max: 5000, feePercent: 3.0 },
        { min: 5001, max: Infinity, feePercent: 4.0 }
    ],
    paymentGatewayFee: 2.0 // Razorpay fee
};

// Calculate platform fee based on amount
export function calculateTransactionFees(amount) {
    const tier = PLATFORM_FEE_CONFIG.tiers.find(t => amount >= t.min && amount <= t.max);
    const platformFeePercent = tier?.feePercent || 3.0;
    
    const platformFee = (amount * platformFeePercent) / 100;
    const gatewayFee = (amount * PLATFORM_FEE_CONFIG.paymentGatewayFee) / 100;
    const totalFees = platformFee + gatewayFee;
    const sellerAmount = amount - totalFees;
    
    return {
        originalAmount: amount,
        platformFee: Math.round(platformFee * 100) / 100,
        gatewayFee: Math.round(gatewayFee * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        sellerAmount: Math.round(sellerAmount * 100) / 100,
        feePercent: platformFeePercent
    };
}

// Create transaction record
export async function createTransaction({ 
    buyerId, 
    sellerId, 
    listingId, 
    listingType, 
    amount, 
    paymentMethod = 'razorpay' 
}) {
    try {
        const supabase = createSupabaseClient();
        const fees = calculateTransactionFees(amount);
        
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                buyer_id: buyerId,
                seller_id: sellerId,
                listing_id: listingId,
                listing_type: listingType,
                amount: amount,
                platform_fee: fees.platformFee,
                gateway_fee: fees.gatewayFee,
                seller_amount: fees.sellerAmount,
                payment_method: paymentMethod,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        
        return { success: true, transaction: data, fees };
    } catch (error) {
        console.error('Error creating transaction:', error);
        return { success: false, error: error.message };
    }
}

// Update transaction status (after payment success)
export async function updateTransactionStatus(transactionId, status, paymentId = null) {
    try {
        const supabase = createSupabaseClient();
        const updateData = { 
            status, 
            updated_at: new Date().toISOString() 
        };
        
        if (paymentId) {
            updateData.payment_id = paymentId;
        }
        
        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', transactionId)
            .select()
            .single();

        if (error) throw error;
        
        return { success: true, transaction: data };
    } catch (error) {
        console.error('Error updating transaction:', error);
        return { success: false, error: error.message };
    }
}

// Get seller's earnings summary
export async function getSellerEarnings(sellerId) {
    try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('transactions')
            .select('amount, seller_amount, platform_fee, created_at')
            .eq('seller_id', sellerId)
            .eq('status', 'completed');

        if (error) throw error;

        const totalSales = data.reduce((sum, t) => sum + t.amount, 0);
        const totalEarnings = data.reduce((sum, t) => sum + t.seller_amount, 0);
        const totalFees = data.reduce((sum, t) => sum + t.platform_fee, 0);

        return {
            success: true,
            summary: {
                totalSales: Math.round(totalSales * 100) / 100,
                totalEarnings: Math.round(totalEarnings * 100) / 100,
                totalFees: Math.round(totalFees * 100) / 100,
                transactionCount: data.length,
                transactions: data
            }
        };
    } catch (error) {
        console.error('Error getting seller earnings:', error);
        return { success: false, error: error.message };
    }
}

// Get platform revenue summary (admin)
export async function getPlatformRevenue() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('amount, platform_fee, gateway_fee, created_at')
            .eq('status', 'completed');

        if (error) throw error;

        const totalVolume = data.reduce((sum, t) => sum + t.amount, 0);
        const totalRevenue = data.reduce((sum, t) => sum + t.platform_fee, 0);
        const totalGatewayFees = data.reduce((sum, t) => sum + t.gateway_fee, 0);
        const netRevenue = totalRevenue - totalGatewayFees;

        return {
            success: true,
            summary: {
                totalVolume: Math.round(totalVolume * 100) / 100,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalGatewayFees: Math.round(totalGatewayFees * 100) / 100,
                netRevenue: Math.round(netRevenue * 100) / 100,
                transactionCount: data.length,
                averageTransactionValue: Math.round((totalVolume / data.length) * 100) / 100
            }
        };
    } catch (error) {
        console.error('Error getting platform revenue:', error);
        return { success: false, error: error.message };
    }
}

export { PLATFORM_FEE_CONFIG };
