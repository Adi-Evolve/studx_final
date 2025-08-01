# 🔧 Step-by-Step SQL Instructions for Adding Duration Column

## If you're getting syntax errors, run these commands ONE BY ONE:

### Step 1: Add the column
```sql
ALTER TABLE public.rooms ADD COLUMN duration TEXT DEFAULT 'monthly';
```

### Step 2: Update existing records  
```sql
UPDATE public.rooms SET duration = 'monthly' WHERE duration IS NULL;
```

### Step 3: Add constraint (optional - skip if it gives errors)
```sql
ALTER TABLE public.rooms ADD CONSTRAINT rooms_duration_check CHECK (duration IN ('monthly', 'yearly'));
```

### Step 4: Add index (optional - skip if it gives errors)
```sql
CREATE INDEX idx_rooms_duration ON public.rooms(duration);
```

### Step 5: Verify it worked
```sql
SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'duration';
```

## 🎯 Minimum Required:
Just run **Step 1** and **Step 2** - that's enough for the API to work!

## ✅ Test after adding the column:
Your API should now save the duration field properly.
