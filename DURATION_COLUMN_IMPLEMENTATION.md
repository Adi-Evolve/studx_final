# 🔧 Add Duration Column to Rooms Table

## 📋 Problem:
The sell page room form has a fees duration option (monthly/yearly) that is not being saved to the database.

## ✅ Solution:
Add a `duration` column to the `rooms` table to store the fee payment period.

## 🛠️ Implementation:

### 1. Database Changes (SQL)
Run this SQL in your Supabase dashboard:

```sql
-- Add duration column to rooms table for fees period (monthly/yearly)

-- Add the duration column to the rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'monthly';

-- Add a check constraint to ensure only valid values are stored
ALTER TABLE public.rooms 
ADD CONSTRAINT IF NOT EXISTS rooms_duration_check 
CHECK (duration IN ('monthly', 'yearly'));

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_duration ON public.rooms(duration);

-- Update existing records to have a default value (optional)
UPDATE public.rooms 
SET duration = 'monthly' 
WHERE duration IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN public.rooms.duration IS 'Fee payment duration: monthly or yearly';
```

### 2. API Changes (Already Done)
✅ Updated `app/api/sell/route.js` to save duration field:

```javascript
duration: body.duration || body.feePeriod || 'monthly'
```

## 🧪 Testing:

### Test API Call:
```javascript
fetch('/api/sell', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'room',
    userEmail: 'studxchange05@gmail.com',
    roomName: 'Test Room with Duration',
    price: 10000,
    duration: 'yearly', // This will now be saved!
    description: 'Test room with yearly duration',
    college: 'VIT Pune',
    roomType: 'single'
  })
})
```

### Expected Response:
```json
{
  "success": true,
  "message": "room listing created successfully",
  "id": "uuid-here",
  "timestamp": "2025-08-01T..."
}
```

## 📝 Frontend Form Integration:

Make sure your room form sends the duration field:

```html
<select name="duration" id="duration">
  <option value="monthly">Monthly</option>
  <option value="yearly">Yearly</option>
</select>
```

```javascript
// Include in form data
const formData = {
  type: 'room',
  userEmail: currentUser.email,
  roomName: document.getElementById('roomName').value,
  price: document.getElementById('price').value,
  duration: document.getElementById('duration').value, // Add this!
  // ... other fields
}
```

## 🎯 Benefits:

1. **Complete Data Storage**: Fee duration preference is now saved
2. **Data Integrity**: Check constraint ensures only valid values
3. **Query Performance**: Index added for fast filtering
4. **Backward Compatibility**: Existing records get default 'monthly' value

## 🚀 Deployment Steps:

1. **Run SQL in Supabase Dashboard**: Copy the SQL above and execute it
2. **Deploy Updated API**: The API code is already updated
3. **Update Frontend Form**: Ensure duration field is included in form submission
4. **Test**: Verify duration is saved correctly

## ✅ Verification:

After running the SQL, you can verify the column was added:

```sql
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'duration';
```

---

**The duration column improvement is ready to deploy!** 🎉

Your users can now select monthly or yearly fee periods and this preference will be properly stored in the database.
