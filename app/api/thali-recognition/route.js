// Enhanced Multi-Dish Thali Recognition API
// File: app/api/thali-recognition/route.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { image, detection_mode = 'comprehensive', max_iterations = 3 } = await request.json();
        
        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // MULTI-PASS DETECTION SYSTEM
        console.log('🔍 Starting multi-pass detection system...');
        
        let allDetectedItems = [];
        let detectionPasses = [];
        let confidenceScores = [];
        
        // Convert base64 image for Gemini
        const imageData = {
            inlineData: {
                data: image.replace(/^data:image\/[a-z]+;base64,/, ''),
                mimeType: image.match(/^data:image\/([a-z]+);base64,/)?.[1] 
                    ? `image/${image.match(/^data:image\/([a-z]+);base64,/)[1]}` 
                    : 'image/jpeg'
            }
        };

        // PASS 1: COMPREHENSIVE SCAN
        console.log('🔍 PASS 1: Comprehensive initial scan...');
        const pass1Result = await runDetectionPass(model, imageData, 1, 'comprehensive');
        if (pass1Result.success) {
            allDetectedItems.push(...pass1Result.items);
            detectionPasses.push({
                pass: 1,
                type: 'comprehensive',
                items_found: pass1Result.items.length,
                confidence: pass1Result.confidence
            });
            confidenceScores.push(pass1Result.confidence);
        }

        // PASS 2: FOCUSED CATEGORY SCAN
        console.log('🔍 PASS 2: Focused category scan...');
        const pass2Result = await runDetectionPass(model, imageData, 2, 'focused_categories');
        if (pass2Result.success) {
            allDetectedItems.push(...pass2Result.items);
            detectionPasses.push({
                pass: 2,
                type: 'focused_categories',
                items_found: pass2Result.items.length,
                confidence: pass2Result.confidence
            });
            confidenceScores.push(pass2Result.confidence);
        }

        // PASS 3: DETAIL VERIFICATION SCAN
        console.log('🔍 PASS 3: Detail verification scan...');
        const pass3Result = await runDetectionPass(model, imageData, 3, 'detail_verification');
        if (pass3Result.success) {
            allDetectedItems.push(...pass3Result.items);
            detectionPasses.push({
                pass: 3,
                type: 'detail_verification',
                items_found: pass3Result.items.length,
                confidence: pass3Result.confidence
            });
            confidenceScores.push(pass3Result.confidence);
        }

        // PASS 4: MISSED ITEMS SCAN (if confidence is still low)
        const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
        if (avgConfidence < 85 || allDetectedItems.length < 3) {
            console.log('🔍 PASS 4: Missed items recovery scan...');
            const pass4Result = await runDetectionPass(model, imageData, 4, 'missed_items');
            if (pass4Result.success) {
                allDetectedItems.push(...pass4Result.items);
                detectionPasses.push({
                    pass: 4,
                    type: 'missed_items',
                    items_found: pass4Result.items.length,
                    confidence: pass4Result.confidence
                });
                confidenceScores.push(pass4Result.confidence);
            }
        }

        console.log(`✅ Multi-pass detection complete. Total raw detections: ${allDetectedItems.length}`);

        // ADVANCED DEDUPLICATION AND CONSOLIDATION
        const consolidatedItems = await advancedConsolidation(allDetectedItems);
        console.log(`✅ After consolidation: ${consolidatedItems.length} unique items`);

        // QUALITY ASSURANCE CHECK
        const qualityCheck = await performQualityAssurance(consolidatedItems, detectionPasses);

        // FINAL ANALYSIS
        const enhancedAnalysis = await enhanceThaliAnalysis(consolidatedItems, {
            meal_type: 'lunch',
            cuisine_style: 'North Indian',
            is_complete_meal: true
        });

        const finalResponse = {
            success: true,
            detection_type: 'multi_pass_thali',
            timestamp: new Date().toISOString(),
            detection_summary: {
                total_passes: detectionPasses.length,
                raw_detections: allDetectedItems.length,
                final_unique_items: consolidatedItems.length,
                overall_confidence: Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length),
                detection_passes: detectionPasses
            },
            items: consolidatedItems,
            thali_analysis: enhancedAnalysis,
            quality_assurance: qualityCheck,
            database_ready: true
        };

        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error('Multi-pass thali recognition error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Multi-pass thali recognition failed',
            message: error.message,
            fallback: {
                manual_entry: true,
                suggested_categories: [
                    "Main Dishes", "Rice Items", "Breads", 
                    "Dal/Lentils", "Vegetables", "Sides", "Beverages"
                ]
            }
        }, { status: 500 });
    }
}

// Multi-pass detection function with different scanning strategies
async function runDetectionPass(model, imageData, passNumber, scanType) {
    try {
        let prompt = '';
        
        switch (scanType) {
            case 'comprehensive':
                prompt = `PASS 1 - COMPREHENSIVE SCAN: You are an expert Indian food detection AI. Scan this thali/meal image systematically and detect ALL visible food items.

SCANNING STRATEGY:
1. Divide image into 9 zones (3x3 grid)
2. Scan each zone methodically for food items
3. Look for containers, bowls, plates, and loose items
4. Count identical items (2 rotis = quantity 2)
5. Be very specific with dish names

RESPONSE FORMAT (JSON ONLY):
{
  "detection_confidence": 85,
  "items": [
    {
      "dish_name": "Specific Dish Name",
      "category": "main_dish/rice/bread/dal/vegetable/sides/beverage/dessert",
      "quantity": 1,
      "position": "top-left/top-center/top-right/center-left/center/center-right/bottom-left/bottom-center/bottom-right",
      "confidence": 90,
      "dietary": "vegetarian/non-vegetarian/vegan",
      "estimated_portion": "small/medium/large",
      "container_type": "bowl/plate/cup/loose"
    }
  ]
}`;
                break;
                
            case 'focused_categories':
                prompt = `PASS 2 - FOCUSED CATEGORY SCAN: Re-examine this image specifically looking for items that might have been missed in the first scan.

FOCUS AREAS:
1. BREADS: Look for any roti, naan, paratha, puri, bhatura (count each piece)
2. SMALL SIDES: Pickles, chutneys, papad, salad, onions, lemon
3. BEVERAGES: Any glasses, cups, bottles
4. GARNISHES: Green chilies, coriander, mint leaves
5. HIDDEN ITEMS: Partially visible or overlapping dishes

SCAN STRATEGY:
- Look at edges and corners of image
- Check for items behind or beside main dishes
- Count small items carefully (2 pieces of papad = quantity 2)
- Look for reflection or shadows indicating more items

JSON RESPONSE:
{
  "detection_confidence": 80,
  "items": [
    {
      "dish_name": "Item Name",
      "category": "category",
      "quantity": 1,
      "position": "position",
      "confidence": 85,
      "dietary": "type",
      "estimated_portion": "size",
      "detection_note": "newly_found/verification"
    }
  ]
}`;
                break;
                
            case 'detail_verification':
                prompt = `PASS 3 - DETAIL VERIFICATION: Examine this image with extreme detail to catch any remaining food items.

DETAILED INSPECTION:
1. TINY ITEMS: Look for very small accompaniments (mustard seeds, etc.)
2. LAYERED ITEMS: Items stacked or behind others
3. CONTAINER CONTENTS: What's actually inside each bowl/plate
4. QUANTITY VERIFICATION: Recount items to ensure accuracy
5. AMBIGUOUS ITEMS: Identify unclear objects that might be food

MICRO-SCANNING:
- Zoom into each section mentally
- Look for food items smaller than a coin
- Check liquid contents (dal, curry, beverages)
- Verify if similar-looking items are actually different dishes

JSON RESPONSE:
{
  "detection_confidence": 90,
  "items": [
    {
      "dish_name": "Detailed Item Name",
      "category": "category",
      "quantity": 1,
      "position": "precise position",
      "confidence": 95,
      "dietary": "type",
      "estimated_portion": "size",
      "verification_note": "detail_confirmed/quantity_adjusted"
    }
  ]
}`;
                break;
                
            case 'missed_items':
                prompt = `PASS 4 - MISSED ITEMS RECOVERY: Final scan to catch any items that previous passes might have missed.

RECOVERY STRATEGY:
1. ASSUMPTION CHECK: Are there typical thali items that should be present but weren't detected?
2. SHADOW ANALYSIS: Look for shadows or reflections indicating hidden items
3. PARTIAL VISIBILITY: Items that are 50%+ visible but might have been ignored
4. COMMON COMBINATIONS: If rice is present, look for dal. If curry exists, look for bread.
5. BACKGROUND ITEMS: Food items in the background or edges

FINAL VERIFICATION:
- Double-check each visible container has been identified
- Look for standard thali accompaniments
- Verify nothing is hiding behind main dishes
- Check for items that blend with background

JSON RESPONSE:
{
  "detection_confidence": 85,
  "items": [
    {
      "dish_name": "Recovered Item Name",
      "category": "category",
      "quantity": 1,
      "position": "position",
      "confidence": 80,
      "dietary": "type",
      "estimated_portion": "size",
      "recovery_note": "final_scan_found"
    }
  ]
}`;
                break;
        }

        const result = await model.generateContent([prompt, imageData]);
        const response = result.response.text();
        
        // Parse JSON response
        let passData;
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            passData = JSON.parse(jsonMatch ? jsonMatch[0] : response);
            
            console.log(`✅ Pass ${passNumber} (${scanType}): Found ${passData.items?.length || 0} items`);
            
            return {
                success: true,
                pass: passNumber,
                type: scanType,
                items: passData.items || [],
                confidence: passData.detection_confidence || 50
            };
            
        } catch (parseError) {
            console.error(`❌ Pass ${passNumber} JSON Parse Error:`, parseError);
            return {
                success: false,
                pass: passNumber,
                type: scanType,
                items: [],
                confidence: 0,
                error: parseError.message
            };
        }
        
    } catch (error) {
        console.error(`❌ Pass ${passNumber} Detection Error:`, error);
        return {
            success: false,
            pass: passNumber,
            type: scanType,
            items: [],
            confidence: 0,
            error: error.message
        };
    }
}

// Advanced consolidation with intelligent deduplication
async function advancedConsolidation(allItems) {
    if (!allItems || allItems.length === 0) return [];

    console.log('🔄 Starting advanced consolidation...');
    
    // Create a map to track unique items
    const itemMap = new Map();
    const similarityThreshold = 0.7; // 70% similarity for deduplication
    
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
                
                // Keep the more specific name
                if (item.dish_name.length > existingItem.dish_name.length) {
                    existingItem.dish_name = item.dish_name;
                }
                
                // Combine positions if different
                if (item.position && !existingItem.position.includes(item.position)) {
                    existingItem.position += `, ${item.position}`;
                }
                
                foundSimilar = true;
                break;
            }
        }
        
        if (!foundSimilar) {
            // Add as new unique item
            const processedItem = {
                item_id: itemMap.size + 1,
                dish_name: item.dish_name.trim(),
                category: item.category || 'unknown',
                quantity: item.quantity || 1,
                position: item.position || 'not specified',
                confidence: item.confidence || 50,
                dietary: item.dietary || 'unknown',
                estimated_portion: item.estimated_portion || 'medium',
                standard_name: standardizeDishName(item.dish_name),
                tags: generateTags(item.dish_name, item.category),
                estimated_price: estimatePrice(item.dish_name, item.category),
                detection_source: 'multi_pass_ai',
                verified: item.confidence > 80
            };
            
            itemMap.set(dishKey, processedItem);
        }
    }
    
    const consolidatedItems = Array.from(itemMap.values());
    console.log(`✅ Consolidation complete: ${consolidatedItems.length} unique items`);
    
    return consolidatedItems;
}

// Calculate similarity between two dish names
function calculateSimilarity(str1, str2) {
    // Simple similarity calculation based on common words and character overlap
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
    const wordSimilarity = commonWords / maxWords;
    
    // Character-level similarity
    const charSimilarity = calculateCharSimilarity(str1, str2);
    
    return (wordSimilarity + charSimilarity) / 2;
}

function calculateCharSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matches++;
    }
    
    return matches / longer.length;
}

// Quality assurance check
async function performQualityAssurance(items, detectionPasses) {
    const qa = {
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
        recommended_action: items.length < 3 ? 'manual_review' : items.filter(item => item.confidence >= 70).length / items.length > 0.8 ? 'auto_approve' : 'user_verify'
    };
    
    return qa;
}

// Standardize dish names for database consistency
function standardizeDishName(dishName) {
    const standardNames = {
        'dal': ['dal tadka', 'yellow dal', 'toor dal', 'moong dal'],
        'rajma': ['rajma curry', 'kidney beans', 'rajma masala'],
        'roti': ['chapati', 'phulka', 'wheat bread'],
        'rice': ['steamed rice', 'plain rice', 'white rice'],
        'jeera rice': ['cumin rice', 'zeera rice'],
        // Add more mappings
    };

    const dishLower = dishName.toLowerCase();
    
    for (const [standard, variants] of Object.entries(standardNames)) {
        if (variants.some(variant => dishLower.includes(variant))) {
            return standard;
        }
    }
    
    return dishName.toLowerCase();
}

// Generate searchable tags
function generateTags(dishName, category) {
    const tags = [category];
    const dishLower = dishName.toLowerCase();
    
    // Add ingredient-based tags
    if (dishLower.includes('paneer')) tags.push('paneer', 'dairy');
    if (dishLower.includes('chicken')) tags.push('chicken', 'non-veg');
    if (dishLower.includes('dal') || dishLower.includes('lentil')) tags.push('lentils', 'protein');
    if (dishLower.includes('rice')) tags.push('rice', 'grain');
    if (dishLower.includes('roti') || dishLower.includes('naan')) tags.push('bread', 'wheat');
    
    // Add cooking method tags
    if (dishLower.includes('fried')) tags.push('fried');
    if (dishLower.includes('curry')) tags.push('gravy', 'curry');
    if (dishLower.includes('dry')) tags.push('dry');
    
    return tags;
}

// Estimate price based on dish and category
function estimatePrice(dishName, category) {
    const priceMap = {
        'main_dish': { min: 80, max: 150 },
        'rice': { min: 40, max: 80 },
        'bread': { min: 15, max: 40 },
        'dal': { min: 60, max: 100 },
        'vegetable': { min: 70, max: 120 },
        'sides': { min: 20, max: 50 },
        'beverage': { min: 30, max: 80 }
    };
    
    const range = priceMap[category] || { min: 50, max: 100 };
    
    // Adjust based on specific dishes
    const dishLower = dishName.toLowerCase();
    let multiplier = 1;
    
    if (dishLower.includes('paneer') || dishLower.includes('chicken')) multiplier = 1.3;
    if (dishLower.includes('special') || dishLower.includes('premium')) multiplier = 1.5;
    if (dishLower.includes('basic') || dishLower.includes('simple')) multiplier = 0.8;
    
    return {
        estimated_min: Math.round(range.min * multiplier),
        estimated_max: Math.round(range.max * multiplier),
        currency: 'INR'
    };
}

// Enhanced thali analysis
async function enhanceThaliAnalysis(items, basicAnalysis) {
    const totalCalories = items.reduce((sum, item) => {
        const calorieMap = {
            'main_dish': 200, 'rice': 150, 'bread': 80, 
            'dal': 120, 'vegetable': 100, 'sides': 50
        };
        return sum + (calorieMap[item.category] || 100) * item.quantity;
    }, 0);

    const totalPrice = items.reduce((sum, item) => {
        return sum + ((item.estimated_price?.estimated_min || 50) * item.quantity);
    }, 0);

    return {
        ...basicAnalysis,
        nutritional_info: {
            estimated_calories: totalCalories,
            protein_sources: items.filter(item => 
                item.tags?.includes('protein') || item.category === 'dal'
            ).length,
            vegetable_count: items.filter(item => 
                item.category === 'vegetable' || item.category === 'sides'
            ).length,
            carb_sources: items.filter(item => 
                item.category === 'rice' || item.category === 'bread'
            ).length
        },
        pricing_info: {
            estimated_total_price: totalPrice,
            price_per_item_avg: Math.round(totalPrice / items.length),
            value_rating: totalPrice < 200 ? 'budget' : totalPrice < 400 ? 'moderate' : 'premium'
        },
        meal_completeness: {
            has_protein: items.some(item => item.tags?.includes('protein') || item.category === 'dal'),
            has_carbs: items.some(item => item.category === 'rice' || item.category === 'bread'),
            has_vegetables: items.some(item => item.category === 'vegetable'),
            has_dairy: items.some(item => item.tags?.includes('dairy')),
            completeness_score: calculateCompletenessScore(items)
        }
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