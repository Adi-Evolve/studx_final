// Database API for saving Thali data
// File: app/api/thali/save/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

export async function POST(request) {
    try {
        const {
            mess_id,
            recognition_data,
            items,
            thali_analysis,
            timestamp,
            user_id
        } = await request.json();

        if (!mess_id || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: 'mess_id and items array are required' },
                { status: 400 }
            );
        }

        // Start database transaction
        const { data: thaliRecord, error: thaliError } = await supabase
            .from('thali_uploads')
            .insert({
                mess_id: mess_id,
                user_id: user_id,
                total_items: items.length,
                overall_confidence: recognition_data.overall_confidence,
                thali_analysis: thali_analysis,
                estimated_price: thali_analysis.pricing_info?.estimated_total_price,
                estimated_calories: thali_analysis.nutritional_info?.estimated_calories,
                upload_timestamp: timestamp || new Date().toISOString(),
                recognition_quality: recognition_data.quality_check
            })
            .select('id')
            .single();

        if (thaliError) {
            console.error('Error creating thali record:', thaliError);
            throw new Error('Failed to save thali record');
        }

        const thali_id = thaliRecord.id;

        // Save individual items
        const itemRecords = items.map(item => ({
            thali_id: thali_id,
            mess_id: mess_id,
            dish_name: item.dish_name,
            standard_name: item.standard_name,
            category: item.category,
            quantity: item.quantity,
            position: item.position,
            confidence: item.confidence,
            dietary: item.dietary,
            estimated_portion: item.estimated_portion,
            estimated_price_min: item.estimated_price?.estimated_min,
            estimated_price_max: item.estimated_price?.estimated_max,
            tags: item.tags,
            manually_verified: item.manually_verified || false,
            manually_added: item.manually_added || false
        }));

        const { data: savedItems, error: itemsError } = await supabase
            .from('thali_items')
            .insert(itemRecords)
            .select();

        if (itemsError) {
            console.error('Error saving items:', itemsError);
            // Rollback thali record
            await supabase.from('thali_uploads').delete().eq('id', thali_id);
            throw new Error('Failed to save thali items');
        }

        // Update mess menu with new items (if they don't exist)
        await updateMessMenu(mess_id, items);

        // Generate analytics
        await generateThaliAnalytics(thali_id, items, thali_analysis);

        return NextResponse.json({
            success: true,
            thali_id: thali_id,
            saved_items: savedItems.length,
            message: 'Thali saved successfully',
            database_ids: {
                thali_id: thali_id,
                item_ids: savedItems.map(item => item.id)
            }
        });

    } catch (error) {
        console.error('Database save error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to save thali to database',
            message: error.message
        }, { status: 500 });
    }
}

// Update mess menu with newly detected items
async function updateMessMenu(mess_id, items) {
    try {
        for (const item of items) {
            // Check if item already exists in mess menu
            const { data: existingItem } = await supabase
                .from('mess_menu_items')
                .select('id')
                .eq('mess_id', mess_id)
                .eq('standard_name', item.standard_name)
                .single();

            if (!existingItem) {
                // Add new item to mess menu
                const menuItem = {
                    mess_id: mess_id,
                    dish_name: item.dish_name,
                    standard_name: item.standard_name,
                    category: item.category,
                    dietary: item.dietary,
                    estimated_price: item.estimated_price?.estimated_min,
                    tags: item.tags,
                    auto_detected: true,
                    detection_count: 1,
                    last_detected: new Date().toISOString()
                };

                await supabase.from('mess_menu_items').insert(menuItem);
            } else {
                // Update detection count
                await supabase
                    .from('mess_menu_items')
                    .update({
                        detection_count: supabase.raw('detection_count + 1'),
                        last_detected: new Date().toISOString()
                    })
                    .eq('id', existingItem.id);
            }
        }
    } catch (error) {
        console.error('Error updating mess menu:', error);
        // Don't throw error - menu update is not critical
    }
}

// Generate analytics data
async function generateThaliAnalytics(thali_id, items, thali_analysis) {
    try {
        const analytics = {
            thali_id: thali_id,
            date: new Date().toISOString().split('T')[0],
            total_items: items.length,
            category_breakdown: getCategoryBreakdown(items),
            dietary_breakdown: getDietaryBreakdown(items),
            price_analysis: thali_analysis.pricing_info,
            nutrition_analysis: thali_analysis.nutritional_info,
            completeness_score: thali_analysis.meal_completeness?.completeness_score,
            detection_quality: calculateDetectionQuality(items)
        };

        await supabase.from('thali_analytics').insert(analytics);
    } catch (error) {
        console.error('Error generating analytics:', error);
        // Don't throw error - analytics is not critical
    }
}

function getCategoryBreakdown(items) {
    const breakdown = {};
    items.forEach(item => {
        breakdown[item.category] = (breakdown[item.category] || 0) + item.quantity;
    });
    return breakdown;
}

function getDietaryBreakdown(items) {
    const breakdown = { vegetarian: 0, 'non-vegetarian': 0, unknown: 0 };
    items.forEach(item => {
        const dietary = item.dietary || 'unknown';
        breakdown[dietary] = (breakdown[dietary] || 0) + item.quantity;
    });
    return breakdown;
}

function calculateDetectionQuality(items) {
    const totalConfidence = items.reduce((sum, item) => sum + item.confidence, 0);
    const avgConfidence = totalConfidence / items.length;
    
    return {
        average_confidence: avgConfidence,
        high_confidence_items: items.filter(item => item.confidence >= 80).length,
        manual_verification_needed: items.filter(item => item.confidence < 60).length,
        quality_score: avgConfidence >= 80 ? 'excellent' : avgConfidence >= 60 ? 'good' : 'needs_review'
    };
}