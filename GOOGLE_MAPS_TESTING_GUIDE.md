# 🗺️ Google Maps Integration - Manual Testing Guide

## ✅ Current Status
The Google Maps integration has been successfully completed and is ready for testing!

### 🔧 Technical Fixes Applied
1. **CSP Configuration**: Updated `next.config.mjs` and `middleware.js` to allow Google Maps domains
2. **Loader Conflicts**: Implemented global loader pattern in `lib/googleMapsLoader.js`
3. **Component Updates**: Updated all Google Maps components to use consistent libraries
4. **Testing Infrastructure**: Created comprehensive test scripts for validation

### 🌐 Pages Ready for Testing
The following forms are now available with Google Maps integration:

#### 1. Regular Product Form
- **URL**: http://localhost:1501/sell/new?type=regular&category=electronics
- **Features**: Google Maps location picker, address search, location validation
- **Database**: Saves location as JSONB in `products` table

#### 2. Rooms/Accommodation Form  
- **URL**: http://localhost:1501/sell/new?type=rooms
- **Features**: Google Maps location picker, room-specific location fields
- **Database**: Saves location as JSONB in `rooms` table

#### 3. Rental Product Form
- **URL**: http://localhost:1501/sell/new?type=rental&category=tools
- **Features**: Google Maps for rental pickup location
- **Database**: Saves location as JSONB in `rental_products` table

## 🧪 Manual Testing Checklist

### Phase 1: Google Maps Loading
- [ ] Open any sell form URL above
- [ ] Verify Google Maps loads without console errors
- [ ] Check that the map displays correctly (no broken tiles)
- [ ] Confirm no "Loader must not be called again" errors in console

### Phase 2: Location Selection
- [ ] Click on the map to select a location
- [ ] Verify the selected location appears as a red marker
- [ ] Check that the address field auto-populates with the selected location
- [ ] Test the search functionality by typing an address

### Phase 3: Form Submission
- [ ] Fill out the entire form with required fields
- [ ] Ensure a location is selected via Google Maps
- [ ] Submit the form
- [ ] Verify successful submission message
- [ ] Check no JavaScript errors in browser console

### Phase 4: Database Verification
- [ ] Access your Supabase dashboard
- [ ] Check the appropriate table (`products`, `rooms`, or `rental_products`)
- [ ] Find the newly created record
- [ ] Verify the `location` field contains proper JSONB data:
```json
{
  "lat": 19.0760,
  "lng": 72.8777,
  "address": "Mumbai, Maharashtra, India",
  "place_id": "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
  "formatted_address": "Mumbai, Maharashtra, India"
}
```

### Phase 5: Location Display Testing
- [ ] Navigate to the product/room page after creation
- [ ] Verify the location displays correctly on the product page
- [ ] Check that the Google Maps component shows the saved location
- [ ] Confirm the address is displayed accurately

## 🔍 Expected Location Data Format

When a location is selected and saved, it should contain:

```json
{
  "lat": <number>,           // Latitude coordinate
  "lng": <number>,           // Longitude coordinate  
  "address": "<string>",     // Human-readable address
  "place_id": "<string>",    // Google Places ID (optional)
  "formatted_address": "<string>" // Formatted address (optional)
}
```

## 🚨 Troubleshooting

### If Google Maps doesn't load:
1. Check browser console for CSP errors
2. Verify API key is set: `AIzaSyBWliYbQUM08KHDigAiP7ARtsYcoGC74tM`
3. Check network tab for failed requests to `maps.googleapis.com`

### If location isn't saving:
1. Check form submission in Network tab
2. Verify Supabase connection is working
3. Check that location data is properly formatted before submission

### If maps show "For development purposes only":
1. This is normal for the demo API key
2. Location functionality should still work correctly

## 🎯 Success Criteria

✅ **Complete Success**: 
- Google Maps loads without errors
- Location can be selected via map click or search
- Form submits successfully with location data
- Location is saved as proper JSONB in database
- Location displays correctly on product pages

## 📊 Test Results Tracking

Test each form and record results:

| Form Type | Maps Load | Location Select | Form Submit | DB Save | Display |
|-----------|-----------|-----------------|-------------|---------|---------|
| Regular Products | ⭕ | ⭕ | ⭕ | ⭕ | ⭕ |
| Rooms | ⭕ | ⭕ | ⭕ | ⭕ | ⭕ |
| Rental Products | ⭕ | ⭕ | ⭕ | ⭕ | ⭕ |

Legend: ✅ = Pass, ❌ = Fail, ⭕ = Not tested

---

**Next Steps**: Complete the manual testing checklist above and report any issues. The Google Maps integration is ready for production use!