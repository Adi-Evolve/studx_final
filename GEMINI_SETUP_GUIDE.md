# 🚀 Gemini Pro Vision Setup Guide
## Real AI-Powered Indian Food Recognition

### 🎯 What You'll Get
- **Real AI Recognition**: Powered by Google's Gemini Pro Vision
- **Indian Food Specialized**: Trained prompts for Indian mess dishes
- **Smart Pricing**: Automatic price estimation for Indian market
- **High Accuracy**: Advanced vision model with contextual understanding

---

## 📋 Setup Steps

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your keys
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies
```bash
# Already done for you
npm install @google/generative-ai
```

### 4. Test the System
1. Login to your StudXchange account
2. Go to Profile → "Register Your Mess"
3. Setup basic mess details
4. Try the AI Menu Creator with real food photos
5. Watch Gemini Pro recognize dishes automatically!

---

## 🍽️ What Gemini Can Recognize

### Indian Breakfast Items:
- **Parathas**: Aloo, Gobi, Methi, Plain
- **South Indian**: Idli, Dosa, Vada, Upma
- **Others**: Poha, Bread varieties

### Lunch/Dinner Items:
- **Dal Varieties**: Dal Tadka, Dal Fry, Sambhar
- **Rice Dishes**: Plain Rice, Biryani, Pulao, Jeera Rice
- **Breads**: Roti, Chapati, Naan
- **Vegetables**: Aloo Sabzi, Bhindi, Palak, etc.
- **Paneer**: Paneer Butter Masala, Palak Paneer

### Snacks & Others:
- **Snacks**: Samosa, Pakora, Dhokla
- **Beverages**: Tea, Coffee, Lassi
- **Sides**: Pickle, Papad, Raita, Chutney

---

## 💰 Pricing & Limits

### Free Tier (Perfect for Testing):
- **15 requests per minute**
- **1,500 requests per day**
- **No credit card required**

### Paid Tier (If needed):
- **$0.0025 per image** after free tier
- **No monthly minimums**
- **Pay only for what you use**

### Cost Examples:
- **100 photos/day**: FREE (under daily limit)
- **2000 photos/day**: ~$1.25/day
- **Monthly for small mess**: $5-20/month

---

## 🎯 How It Works

### Smart Prompting System:
1. **Specialized Prompts**: Trained specifically for Indian dishes
2. **Price Intelligence**: Uses Indian market pricing knowledge
3. **Context Awareness**: Understands mess vs restaurant context
4. **Accuracy Optimization**: Filters low-confidence results

### Example Detection:
```json
[
  {
    "name": "Dal Tadka",
    "category": "lunch",
    "price": "40",
    "description": "Yellow lentils with tempering",
    "confidence": "0.89"
  },
  {
    "name": "Jeera Rice",
    "category": "lunch", 
    "price": "25",
    "description": "Cumin flavored basmati rice",
    "confidence": "0.92"
  }
]
```

---

## 🔧 Advanced Configuration

### Custom Pricing Ranges:
Edit the API prompt in `/app/api/ai/gemini-detect/route.js`:
```javascript
Price guidelines for Indian mess:
- Dal dishes: 30-50 rupees
- Rice dishes: 20-80 rupees
- Paneer dishes: 70-100 rupees
// Adjust these ranges for your region
```

### Add New Dish Categories:
```javascript
Focus on common Indian mess dishes like:
- Your new category
- Specific regional dishes
- Local specialties
```

---

## 🧪 Testing Tips

### Best Photo Practices:
1. **Good Lighting**: Natural light works best
2. **Clear View**: All dishes visible and separated
3. **Close-up**: Fill frame with food, avoid too much background
4. **Multiple Angles**: Try different angles if first attempt isn't perfect

### Expected Results:
- **2-5 dishes per photo**: Optimal recognition range
- **85-95% confidence**: Typical for clear photos
- **1-3 second processing**: Response time

---

## 🚀 Production Deployment

### Environment Variables:
```env
# Production .env.local
GEMINI_API_KEY=your_production_key
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

### Monitoring Usage:
- Check Google AI Studio dashboard for usage stats
- Monitor daily limits and adjust if needed
- Set up alerts for high usage

---

## 🔄 Fallback Strategy

The system includes smart fallbacks:
1. **Primary**: Gemini Pro Vision detection
2. **Fallback 1**: Manual menu entry suggestion
3. **Fallback 2**: Error handling with user guidance

---

## 📞 Support & Troubleshooting

### Common Issues:

#### "No image provided" Error:
- Check file size (max 20MB)
- Ensure image format (JPG, PNG, WebP)

#### "API key not valid" Error:
- Verify Gemini API key in .env.local
- Check Google AI Studio for key status

#### "Rate limit exceeded" Error:
- You've hit the 15 requests/minute limit
- Wait a minute and try again
- Consider upgrading to paid tier

#### Poor Recognition Results:
- Try better lighting
- Ensure dishes are clearly visible
- Use close-up photos
- Avoid cluttered backgrounds

---

## 🎉 Success Metrics

After setup, you should see:
- **Real AI recognition** working with food photos
- **Accurate Indian dish names** (not generic terms)
- **Realistic pricing** for your local market
- **Professional menu formatting** automatically

Your mess owners will love how easy it is to create menus - just take a photo and the AI does the rest! 📸🍽️✨