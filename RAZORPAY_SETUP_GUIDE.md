# 🚀 RAZORPAY SETUP GUIDE - Digital Notes Payment System

## 📚 **NOTES-ONLY PAYMENT SYSTEM**

**Why Notes Only?**
- ✅ **Digital delivery** - Instant access after payment
- ✅ **No shipping** - No physical meetups required  
- ✅ **Secure transactions** - Protected digital downloads
- ✅ **Perfect for students** - Study materials, lecture notes
- ✅ **Scalable revenue** - Automated payment processing

**Physical Products (Laptops, Books, etc.):**
- Use WhatsApp contact for negotiation and meetups
- Cash on delivery or bank transfer
- No platform fees (builds user base)

---

## 📋 **STEP 1: Create Razorpay Account (5 minutes)**

### **1.1 Sign Up:**
1. Go to **https://razorpay.com/**
2. Click **"Sign Up"**
3. Enter your details:
   - Business Email
   - Business Name: "StudX Marketplace" 
   - Phone Number
   - Password

### **1.2 Verify Account:**
1. Check your email for verification link
2. Click verification link
3. Complete phone verification via OTP

---

## 🔑 **STEP 2: Get API Keys (2 minutes)**

### **2.1 Access Dashboard:**
1. Login to Razorpay Dashboard
2. You'll see the main dashboard

### **2.2 Generate Test Keys:**
1. Click **"Settings"** in left sidebar
2. Click **"API Keys"** 
3. Under **"Test Mode"**, click **"Generate Key"**
4. Copy both keys:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secure!)

### **2.3 Enable Live Mode (Later):**
- For now, use Test Mode for development
- Switch to Live Mode after KYC completion

---

## ⚙️ **STEP 3: Add Keys to StudX (1 minute)**

### **3.1 Open .env.local file:**
```bash
# Navigate to your StudX project
cd "c:\Users\adiin\OneDrive\Documents\GitHub\studx"
# Open .env.local in your editor
```

### **3.2 Add Razorpay Keys:**
Add these lines to your `.env.local` file:
```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_here
RAZORPAY_SECRET_KEY=your_actual_secret_key_here
RAZORPAY_WEBHOOK_SECRET=any_random_string_for_now
```

**Example:**
```bash
# Razorpay Configuration  
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_SECRET_KEY=abcdef1234567890abcdef1234567890
RAZORPAY_WEBHOOK_SECRET=studx_webhook_secret_123
```

---

## 🧪 **STEP 4: Test Payment System (10 minutes)**

### **4.1 Restart Development Server:**
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### **4.2 Test the Flow:**
1. Open **http://localhost:3001** in browser
2. Go to **Notes** section or search for notes
3. Click on any **note listing** (not products/rooms)
4. Click **"💳 Buy Now - ₹XXX"** button (only appears for notes)
5. **Payment modal should open** with digital notes fee breakdown
6. Click **"Pay ₹XXX"** 
7. **Razorpay checkout should open**

### **4.3 Test Payment (Use Test Cards):**
**Test Card Numbers (These won't charge real money):**
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits (123)
- **Expiry**: Any future date (12/25)
- **Name**: Any name

### **4.4 UPI Testing:**
- Use any UPI ID ending with `.success@razorpay`
- Example: `test.success@razorpay`

---

## 📊 **STEP 5: Verify Everything Works**

### **5.1 Check Transaction Records:**
1. Payment should complete successfully
2. Check Razorpay Dashboard → Payments
3. You should see test transaction

### **5.2 Check Database:**
```bash
# Run verification script
node deploy_transaction_system.js
```
Should show: **"🚀 SYSTEM READY TO GO LIVE!"**

---

## 💰 **STEP 6: Go Live (When Ready)**

### **6.1 Complete KYC:**
1. Razorpay Dashboard → Account & Settings
2. Upload business documents
3. Wait for approval (1-2 days)

### **6.2 Generate Live Keys:**
1. Settings → API Keys
2. Generate Live Keys
3. Replace test keys with live keys in `.env.local`

### **6.3 Configure Webhooks:**
1. Settings → Webhooks
2. Add webhook URL: `https://yoursite.com/api/webhooks/razorpay`
3. Select events: `payment.authorized`, `payment.failed`

---

## 🎯 **Fee Structure (Already Configured)**

| Amount Range | Platform Fee | Example |
|--------------|--------------|---------|
| ₹0 - ₹500 | 2% | ₹100 → ₹2 fee, ₹96 to seller |
| ₹501 - ₹5,000 | 3% | ₹1,000 → ₹30 fee, ₹950 to seller |
| ₹5,001+ | 4% | ₹10,000 → ₹400 fee, ₹9,400 to seller |

---

## 📈 **Expected Results**

### **Immediate (Week 1):**
- Payment system working
- 2-3 test transactions successful
- User feedback on payment flow

### **Month 1:**
- 10-20 real transactions
- ₹200-500 platform revenue
- Seller satisfaction high

### **Month 3:**
- 50+ transactions monthly
- ₹750+ monthly revenue
- Payment flow optimized

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **"Razorpay is not defined" Error:**
- Check if script is loaded in `app/layout.js`
- Refresh the page

#### **"Invalid Key ID" Error:**
- Verify key in `.env.local` is correct
- Restart development server

#### **Payment Modal Not Opening:**
- Check browser console for errors
- Verify PaymentModal component imported

#### **Database Errors:**
- Run `create_transactions_table.sql` in Supabase
- Check database permissions

### **Get Help:**
- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test in private browser window if issues

---

## ✅ **Success Checklist**

- [ ] Razorpay account created
- [ ] Test API keys generated  
- [ ] Keys added to `.env.local`
- [ ] Development server restarted
- [ ] Payment modal opens on "Buy Now"
- [ ] Razorpay checkout loads
- [ ] Test payment completes successfully
- [ ] Transaction recorded in database
- [ ] Ready for real transactions! 🎉

**Total Setup Time: ~20 minutes**
**Start Earning: Immediately after testing!**

---

Would you like me to help you with any specific step?
