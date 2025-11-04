// Test script for multi-pass thali detection system
const fs = require('fs');
const path = require('path');

// Test the multi-pass detection logic
async function testMultiPassDetection() {
    console.log('🧪 Testing Multi-Pass Thali Detection System');
    console.log('=' .repeat(60));
    
    // Simulate detection results from multiple passes
    const mockDetectionResults = [
        // Pass 1: Comprehensive scan
        {
            success: true,
            pass: 1,
            type: 'comprehensive',
            items: [
                { dish_name: 'Dal Tadka', category: 'dal', quantity: 1, confidence: 85 },
                { dish_name: 'Steamed Rice', category: 'rice', quantity: 1, confidence: 90 },
                { dish_name: 'Roti', category: 'bread', quantity: 2, confidence: 88 },
                { dish_name: 'Mixed Vegetable Curry', category: 'vegetable', quantity: 1, confidence: 80 },
                { dish_name: 'Rajma Curry', category: 'main_dish', quantity: 1, confidence: 82 }
            ],
            confidence: 85
        },
        
        // Pass 2: Focused categories scan  
        {
            success: true,
            pass: 2,
            type: 'focused_categories',
            items: [
                { dish_name: 'Pickle', category: 'sides', quantity: 1, confidence: 75 },
                { dish_name: 'Papad', category: 'sides', quantity: 2, confidence: 78 },
                { dish_name: 'Raita', category: 'sides', quantity: 1, confidence: 80 },
                { dish_name: 'Green Chutney', category: 'sides', quantity: 1, confidence: 70 }
            ],
            confidence: 76
        },
        
        // Pass 3: Detail verification scan
        {
            success: true,
            pass: 3,
            type: 'detail_verification',
            items: [
                { dish_name: 'Dal Tadka', category: 'dal', quantity: 1, confidence: 87 }, // Duplicate for testing
                { dish_name: 'Sliced Onions', category: 'sides', quantity: 1, confidence: 65 },
                { dish_name: 'Lemon Wedge', category: 'sides', quantity: 2, confidence: 60 }
            ],
            confidence: 71
        },
        
        // Pass 4: Missed items recovery
        {
            success: true,
            pass: 4,
            type: 'missed_items',
            items: [
                { dish_name: 'Buttermilk', category: 'beverage', quantity: 1, confidence: 68 },
                { dish_name: 'Green Chilies', category: 'sides', quantity: 3, confidence: 55 }
            ],
            confidence: 62
        }
    ];
    
    console.log('📊 Mock Detection Results:');
    mockDetectionResults.forEach(result => {
        console.log(`   Pass ${result.pass} (${result.type}): ${result.items.length} items found`);
    });
    
    // Test consolidation logic
    console.log('\n🔄 Testing Advanced Consolidation...');
    
    // Combine all items
    const allItems = mockDetectionResults.flatMap(result => result.items);
    console.log(`   Total raw items: ${allItems.length}`);
    
    // Test deduplication
    const consolidatedItems = await simulateAdvancedConsolidation(allItems);
    console.log(`   Unique items after consolidation: ${consolidatedItems.length}`);
    
    // Display final results
    console.log('\n📋 Final Consolidated Items:');
    consolidatedItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.dish_name} (${item.category}) x${item.quantity} - Confidence: ${item.confidence}%`);
    });
    
    // Test quality assurance
    console.log('\n✅ Quality Assurance Check:');
    const qa = await simulateQualityAssurance(consolidatedItems, mockDetectionResults);
    console.log(`   Total Items: ${qa.total_items}`);
    console.log(`   High Confidence Items: ${qa.high_confidence_items}`);
    console.log(`   Completeness Score: ${qa.completeness_score}%`);
    console.log(`   Detection Quality: ${qa.detection_quality}`);
    console.log(`   Recommended Action: ${qa.recommended_action}`);
    
    console.log('\n🎯 Test Summary:');
    console.log(`   ✅ Multi-pass detection: ${mockDetectionResults.length} passes completed`);
    console.log(`   ✅ Deduplication: ${allItems.length - consolidatedItems.length} duplicates removed`);
    console.log(`   ✅ Quality score: ${qa.completeness_score}% completeness`);
    console.log(`   ✅ Final item count: ${consolidatedItems.length} unique dishes detected`);
    
    return {
        success: true,
        totalPasses: mockDetectionResults.length,
        finalItemCount: consolidatedItems.length,
        qualityScore: qa.completeness_score,
        recommendation: qa.recommended_action
    };
}

// Simulate advanced consolidation logic
async function simulateAdvancedConsolidation(allItems) {
    if (!allItems || allItems.length === 0) return [];

    const itemMap = new Map();
    const similarityThreshold = 0.7;
    
    for (let item of allItems) {
        if (!item.dish_name) continue;
        
        const dishKey = item.dish_name.toLowerCase().trim();
        let foundSimilar = false;
        
        // Check for similar items
        for (let [existingKey, existingItem] of itemMap) {
            const similarity = calculateSimilarity(dishKey, existingKey);
            
            if (similarity > similarityThreshold) {
                // Merge similar items
                existingItem.quantity += (item.quantity || 1);
                existingItem.confidence = Math.max(existingItem.confidence, item.confidence || 0);
                
                if (item.dish_name.length > existingItem.dish_name.length) {
                    existingItem.dish_name = item.dish_name;
                }
                
                foundSimilar = true;
                break;
            }
        }
        
        if (!foundSimilar) {
            const processedItem = {
                item_id: itemMap.size + 1,
                dish_name: item.dish_name.trim(),
                category: item.category || 'unknown',
                quantity: item.quantity || 1,
                confidence: item.confidence || 50,
                dietary: item.dietary || 'vegetarian',
                estimated_portion: item.estimated_portion || 'medium',
                tags: [item.category],
                verified: item.confidence > 80
            };
            
            itemMap.set(dishKey, processedItem);
        }
    }
    
    return Array.from(itemMap.values());
}

// Calculate similarity between dish names
function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let commonWords = 0;
    for (let word1 of words1) {
        for (let word2 of words2) {
            if (word1.includes(word2) || word2.includes(word1)) {
                commonWords++;
                break;
            }
        }
    }
    
    const maxWords = Math.max(words1.length, words2.length);
    return commonWords / maxWords;
}

// Simulate quality assurance
async function simulateQualityAssurance(items, detectionPasses) {
    return {
        total_items: items.length,
        high_confidence_items: items.filter(item => item.confidence >= 80).length,
        medium_confidence_items: items.filter(item => item.confidence >= 60 && item.confidence < 80).length,
        low_confidence_items: items.filter(item => item.confidence < 60).length,
        detection_coverage: {
            has_main_dish: items.some(item => item.category === 'main_dish' || item.category === 'dal'),
            has_carbs: items.some(item => item.category === 'rice' || item.category === 'bread'),
            has_vegetables: items.some(item => item.category === 'vegetable'),
            has_sides: items.some(item => item.category === 'sides'),
        },
        completeness_score: calculateCompletenessScore(items),
        detection_quality: detectionPasses.length >= 3 ? 'comprehensive' : 'standard',
        recommended_action: items.length < 3 ? 'manual_review' : 
                          items.filter(item => item.confidence >= 70).length / items.length > 0.8 ? 'auto_approve' : 'user_verify'
    };
}

function calculateCompletenessScore(items) {
    let score = 0;
    const categories = new Set(items.map(item => item.category));
    
    if (categories.has('main_dish') || categories.has('dal')) score += 25;
    if (categories.has('rice')) score += 20;
    if (categories.has('bread')) score += 15;
    if (categories.has('vegetable')) score += 20;
    if (categories.has('sides')) score += 10;
    if (categories.has('beverage')) score += 10;
    
    return Math.min(score, 100);
}

// Run the test
if (require.main === module) {
    testMultiPassDetection()
        .then(result => {
            console.log('\n🏆 Multi-Pass Detection System Test Completed Successfully!');
            console.log(JSON.stringify(result, null, 2));
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
        });
}

module.exports = { testMultiPassDetection };