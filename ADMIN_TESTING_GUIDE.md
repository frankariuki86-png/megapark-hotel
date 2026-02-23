# Admin Dashboard Testing Guide

## Fixes Applied ✅

### 1. Menu Management - Fixed
- ✅ Changed category values to match backend:
  - 'main' → 'mains'
  - 'appetizer' → 'appetizers'
  - 'dessert' → 'desserts'
  - 'drink' → 'drinks'
  - Added 'sides' option
- ✅ Added photo upload (single image, file picker instead of URL)

### 2. Rooms Management - Enhanced
- ✅ Added multi-photo upload (up to 5 photos)
- ✅ Added image preview before saving
- ✅ Supports local file selection

### 3. Halls Management - Fixed & Enhanced
- ✅ Fixed field name: 'basePrice' → 'pricePerDay'
- ✅ Removed 'hallType' field (not in backend schema)
- ✅ Removed 'area' field (not in backend schema)
- ✅ Added multi-photo upload (up to 5 photos)
- ✅ Added image preview before saving
- ✅ Fixed table display to use correct field names

## Backend API Verification ✅

### Hall Creation Test
```
POST /api/halls
{
  "name": "Grand Ballroom",
  "description": "Spacious hall",
  "capacity": 500,
  "pricePerDay": 50000,
  "images": [],
  "amenities": ["AC", "WiFi"],
  "availability": true
}
Response: 201 Created ✅
```

### Menu Creation Test
```
POST /api/menu
{
  "name": "Nyama Choma",
  "description": "Grilled meat",
  "category": "mains",
  "price": 1500,
  "preparationTime": 30
}
Response: 201 Created ✅
```

---

## Testing Steps

### Step 1: Clear Browser Cache
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Clear cookies and cached data
3. Refresh the page

### Step 2: Login to Admin Dashboard
- URL: `http://localhost:5175/megapark-hotel/admin`
- Email: `admintest@megapark.com`
- Password: `Admin@123456`

### Step 3: Test Menu Management

#### Create New Menu Item
1. Click "+ Add Menu Item"
2. Fill in form:
   - **Name**: "Ugali" (required)
   - **Category**: Select "Mains" (or any category)
   - **Price**: 300
   - **Description**: "Traditional corn meal"
   - **Prep Time**: 15 min
   - **Photo**: Click to select local image file (1 photo)
3. Click "Save"
4. **Expected**: Menu item appears in list below ✅

#### Edit Menu Item
1. Find item in list
2. Click "Edit"
3. Modify any field
4. Click "Save"
5. **Expected**: Changes saved ✅

### Step 4: Test Rooms Management

#### Create New Room
1. Click "+ Add Room"
2. Fill in form:
   - **Room Number**: "101" (required)
   - **Room Name**: "Standard Room" (required)
   - **Type**: Select "Standard"
   - **Price/Night**: 5000
   - **Capacity**: 2
   - **Description**: "Comfortable room with a view"
   - **Photos**: Select up to 5 local image files
   - Check "Available"
3. Click "Save"
4. **Expected**: Room appears in table ✅

#### Verify Photo Upload
- Photos should show as preview thumbnails (80x80px)
- File name should display next to file picker
- Can select 1-5 photos max

### Step 5: Test Halls Management (MAIN TEST)

#### Create New Hall
1. Click "+ Add Hall"
2. Fill in form:
   - **Hall Name**: "Grand Ballroom" (required)
   - **Description**: "Perfect for weddings"
   - **Capacity**: 500 (required)
   - **Price Per Day**: 75000 (required) ← **KEY: Now using pricePerDay, not basePrice**
   - **Photos**: Select 1-5 local image files
   - Check "Available"
3. Click "Save"
4. **Expected**: Hall appears in table ✅

#### Verify Hall Display
- Table should show:
  - Name, Type (Hall), Capacity, Amenities, Price/Day, Available status
  - ✅ Status: Shows checkmark if available
  - Price correctly labeled as "Price/Day (KES)"

#### Edit Hall
1. Find hall in list
2. Click "Edit"
3. Modify details (e.g., price to 80000)
4. Add/change photos
5. Click "Save"
6. **Expected**: Changes saved ✅

#### Create Multiple Halls
1. Repeat hall creation 2-3 times with different names
2. **Expected**: All halls appear in list ✅

### Step 6: Verify Photo Upload Features

#### For Menu
- ✅ Single photo upload
- ✅ Shows preview thumbnail
- ✅ Shows filename
- ✅ File stored as base64 in images field

#### For Rooms & Halls
- ✅ Multiple photos (up to 5)
- ✅ Shows all preview thumbnails in a row
- ✅ Shows count of selected files (e.g., "2 file(s) selected")
- ✅ Preview updates in real-time

---

## Troubleshooting

### Issue: Photos not showing
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page
- Try smaller image files (< 2MB)

### Issue: Menu/Hall not creating
**Solution**:
- Check browser console (F12) for errors
- Verify all required fields are filled
- Check backend is running (should see logs in terminal)

### Issue: "Can't create more halls"
**Solution**:
- This should now work! If not creating, check:
  - `pricePerDay` field is being sent (not `basePrice`)
  - Required fields (name, capacity, pricePerDay) are filled
  - No validation errors in console

### Issue: 401 Unauthorized after changes
**Solution**:
- The frontend now correctly uses `__megapark_jwt__` token key
- Clear cache and login again
- If still issues, restart backend

---

## Console Checks

When testing, check browser console (F12) for:
- ✅ No 401 Unauthorized errors
- ✅ No "Failed to fetch" messages
- ✅ No NaN warnings for numeric fields
- ✅ API responses showing 201 for CREATE, 200 for UPDATE

---

## Success Criteria

All of the following should work without errors:

1. ✅ Create menu items with correct categories
2. ✅ Upload photo for menu item
3. ✅ Create rooms with photos (1-5)
4. ✅ Create halls (multiple) with photos
5. ✅ Edit any item and save changes
6. ✅ All photos display as previews before save
7. ✅ Photos persist when editing
8. ✅ No console errors or warnings
9. ✅ No 401/400 API errors

---

## Backend Running Verification

Run this command to test:
```powershell
curl http://localhost:3000/api/health
```

Expected response: `200 OK` with status info

Or test menu creation:
```powershell
$token = (Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"admintest@megapark.com","password":"Admin@123456"}' -ContentType "application/json" | ConvertFrom-Json).accessToken

$menuData = @{name="Test Item"; category="mains"; price=500; preparationTime=20} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/menu" -Method POST -Headers @{"Authorization"="Bearer $token"} -Body $menuData -ContentType "application/json"
```

---

## Timeline

- Backend fixes applied: ✅ pricePerDay, correct categories
- Frontend fixes applied: ✅ Field mappings, photo upload UI
- API tested: ✅ Hall and menu creation verified
- Ready for testing: ✅ YES

**Start testing now! All components should work correctly.**
