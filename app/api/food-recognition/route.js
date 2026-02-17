// Smart Food Recognition API using Gemini 2.5 Flash
// File: app/api/food-recognition/route.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { image, confidence_threshold = 0.6 } = await request.json();
        
        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Smart prompt for Indian food recognition
        const prompt = `You are an expert Indian food recognition AI. Analyze this image and provide detailed information about the food items.

Instructions:
1. Identify specific Indian dishes (be precise - e.g., "Palak Paneer" not just "curry")
2. Provide confidence scores (0-100) for each identification
3. List visible ingredients
4. Classify as vegetarian/non-vegetarian
5. Identify the region/cuisine type if possible
6. Note any accompaniments (rice, bread, etc.)

Return response in this exact JSON format:
{
  "predictions": [
    {
      "dish_name": "specific dish name",
      "confidence": 85,
      "category": "curry/bread/rice/snack/dessert/beverage",
      "dietary": "vegetarian/non-vegetarian/vegan",
      "region": "North Indian/South Indian/Bengali/Gujarati/etc",
      "ingredients": ["ingredient1", "ingredient2"],
      "description": "brief description of the dish"
    }
  ],
  "overall_confidence": 85,
  "notes": "additional observations or uncertainties",
  "fallback_suggestions": ["alternative dish names if uncertain"]
}

If you cannot clearly identify the dish, set confidence below 60 and provide fallback suggestions.`;

        // Convert base64 image to the format Gemini expects
        const imageData = {
            inlineData: {
                data: image.replace(/^data:image\/[a-z]+;base64,/, ''),
                mimeType: image.match(/^data:image\/([a-z]+);base64,/)?.[1] 
                    ? `image/${image.match(/^data:image\/([a-z]+);base64,/)[1]}` 
                    : 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imageData]);
        const response = result.response.text();
        
        // Parse the JSON response
        let foodData;
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            foodData = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        } catch (parseError) {
            // Fallback if JSON parsing fails
            foodData = {
                predictions: [{
                    dish_name: "Unidentified Indian Food",
                    confidence: 30,
                    category: "unknown",
                    dietary: "unknown",
                    region: "unknown",
                    ingredients: [],
                    description: response.substring(0, 200)
                }],
                overall_confidence: 30,
                notes: "Could not parse structured response",
                fallback_suggestions: ["Please try a clearer image"]
            };
        }

        // Apply confidence threshold filtering
        const filteredPredictions = foodData.predictions.filter(
            pred => pred.confidence >= (confidence_threshold * 100)
        );

        // Smart response handling
        let finalResponse;
        if (filteredPredictions.length > 0) {
            finalResponse = {
                success: true,
                recognition_type: "high_confidence",
                ...foodData,
                predictions: filteredPredictions
            };
        } else if (foodData.overall_confidence >= 40) {
            finalResponse = {
                success: true,
                recognition_type: "medium_confidence",
                ...foodData,
                message: "Moderate confidence. Please verify the identification."
            };
        } else {
            finalResponse = {
                success: true,
                recognition_type: "low_confidence",
                predictions: [],
                message: "Could not reliably identify the dish. Please try a clearer image or select manually.",
                suggestions: foodData.fallback_suggestions || [
                    "Ensure good lighting",
                    "Center the dish in frame", 
                    "Remove distracting backgrounds",
                    "Try a closer shot"
                ]
            };
        }

        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error('Food recognition error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Food recognition failed',
            message: error.message.includes('API') 
                ? 'API service temporarily unavailable'
                : 'Please try again with a clearer image',
            fallback: {
                manual_selection: true,
                categories: [
                    "Curries & Gravies",
                    "Rice Dishes", 
                    "Breads",
                    "Snacks & Appetizers",
                    "Desserts",
                    "Beverages"
                ]
            }
        }, { status: 500 });
    }
}