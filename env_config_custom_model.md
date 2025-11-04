# 🔧 Environment Configuration for Custom Model Integration
# Add these to your .env.local file

# ====================================================================
# CUSTOM MODEL CONFIGURATION
# ====================================================================

# Your Hugging Face Space URL (replace with your actual URL)
CUSTOM_MODEL_URL=https://[YOUR_USERNAME]-studxchange-food-detection.hf.space

# Hugging Face Access Token (optional, for private spaces)
HUGGINGFACE_TOKEN=your_huggingface_token_here

# ====================================================================
# GEMINI PRO CONFIGURATION (Fallback)
# ====================================================================

# Gemini Pro API Key (Google AI Studio)
GEMINI_API_KEY=AIzaSyCHTpY-5RRuGWXdtsZEvrqmLMvFYWXjgoc

# ====================================================================
# A/B TESTING CONFIGURATION
# ====================================================================

# Percentage of requests to route to custom model (0.0 to 1.0)
# 0.5 = 50% custom model, 50% Gemini Pro
CUSTOM_MODEL_PERCENTAGE=0.5

# Force specific model for testing (optional)
# Values: 'custom', 'gemini', or leave empty for A/B testing
FORCE_MODEL_TYPE=

# ====================================================================
# PERFORMANCE MONITORING
# ====================================================================

# Enable performance logging
ENABLE_PERFORMANCE_LOGS=true

# Maximum detection timeout (milliseconds)
DETECTION_TIMEOUT=30000

# ====================================================================
# DEPLOYMENT CONFIGURATION
# ====================================================================

# Environment type
NODE_ENV=production

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=https://your-studxchange-domain.com

# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ====================================================================
# OPTIONAL: CUSTOM MODEL FALLBACK CHAIN
# ====================================================================

# Secondary custom model URL (if you have multiple models)
SECONDARY_CUSTOM_MODEL_URL=

# Enable fallback chain: Custom Model → Secondary Model → Gemini Pro
ENABLE_FALLBACK_CHAIN=true

# ====================================================================
# MONITORING AND ANALYTICS
# ====================================================================

# Enable detection analytics
ENABLE_DETECTION_ANALYTICS=true

# Webhook URL for detection events (optional)
DETECTION_WEBHOOK_URL=

# ====================================================================
# EXAMPLE .env.local FILE
# ====================================================================

# Copy this section to your .env.local file and update with your values:

# CUSTOM_MODEL_URL=https://adityarai-studxchange-food-detection.hf.space
# HUGGINGFACE_TOKEN=hf_your_token_here
# GEMINI_API_KEY=your_gemini_key_here
# CUSTOM_MODEL_PERCENTAGE=0.5
# ENABLE_PERFORMANCE_LOGS=true
# DETECTION_TIMEOUT=30000