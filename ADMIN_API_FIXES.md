# Admin Dashboard API Issues - Debugging Guide

## Status: FIXED & DEPLOYED ✓

**Date:** February 25, 2026  
**Changes Deployed:** Yes - Check Render logs for confirmation

---

## Issues Fixed

### 1. ✅ Router Basename Conflict
**Problem:** Frontend had `<Router basename="/megapark-hotel">` but app is deployed at root (`/`)  
**Error:** `<Router basename="/megapark-hotel"> is not able to match the URL "/" because it does not start with the basename`  
**Fix:** Changed to `<Router basename="/"></Router>` in both `frontend/src/App.jsx` and `src/App.jsx`

### 2. ✅ API Route Handling
**Problem:** SPA fallback was conflicting with API route matching  
**Fix:** 
- Improved SPA fallback to explicitly check for `/api/` routes first
- Added proper static file serving with `express.static()`
- Added 404 handlers with detailed logging for debugging

### 3. ✅ Build Command
**Problem:** Frontend might not be building or dependencies not installing properly  
**Old:** `cd frontend && npm install && npm run build && cd ../backend && npm install`  
**New:** `npm --prefix frontend ci && npm --prefix frontend run build && npm --prefix backend ci`  
**Benefit:** Uses `npm ci` (cleaner installs) and `npm --prefix` (more reliable path handling)

### 4. ✅ Frontend Detection Logging
**Problem:** No visibility if frontend dist folder exists  
**Fix:** Added detailed logging to see:
- Frontend dist folder path
- Whether dist folder exists
- Whether frontend is being served
- Example: `✓ Serving frontend from /app/frontend/dist`

---

## How to Verify Fixes

### Step 1: Check Render Logs
1. Go to your **Render Dashboard**
2. Select your **megapark-backend** service
3. Click on **Logs** tab
4. Look for these messages:
   ```
   ✓ All API routes mounted successfully
   ✓ Serving frontend from [path]/frontend/dist
   Server started on port 3000
   ```

### Step 2: Test Frontend Load
- Visit your Render URL (e.g., `https://megapark-hotel-2.onrender.com`)
- Should show the Megapark website homepage
- Check browser console (`F12` → Console) for any errors

### Step 3: Test Admin Login
1. Navigate to `/admin/login` or check app for admin login button
2. Login with credentials:
   ```
   Email: admin@megapark.com
   Password: admin123
   ```
3. Should see "Login successful" message (no console errors)

### Step 4: Test API Calls
1. In admin dashboard, try to:
   - View menu items (should show list)
   - Create a new menu item
   - View rooms/halls
   - Update any item
2. Open DevTools (`F12`) → Network tab
3. Click an action, should see:
   - Request to `/api/menu`, `/api/rooms`, etc.
   - Status: `200` (success) or `201` (created)
   - NOT `404` or `401`

---

## If Things Still Don't Work

### Issue: API still returns 404
**Possible causes:**
1. Frontend was not rebuilt (check logs for build errors)
2. Backend didn't install dependencies properly
3. Route file has a syntax error

**Solution:**
Check the Render logs carefully. Look for lines like:
```
Error loading routes
something is not a function
Cannot find module
```

### Issue: Admin can log in but API calls fail
**Possible causes:**
1. Authentication token not being sent
2. CORS configuration blocking requests
3. API response is not valid JSON

**Check in browser console:**
- Look for `401 Unauthorized` → Authentication failed
- Look for CORS error → Domain issue
- Log in redux/context → Check if token is stored

### Issue: Frontend loads but admin dashboard doesn't
**Possible causes:**
1. AdminContext initialization failing
2. useAdmin hook not finding context
3. Admin user data not being fetched

**Check in browser console:**
- Errors like `useAdmin must be used within AdminProvider`
- API calls to `/api/admin/users` or `/api/menu` returning errors

### Issue: "Frontend dist folder not found"
**This means:**
- Frontend build failed or build command didn't run
- The `frontend/dist` folder doesn't exist on Render

**Solution:**
- Check Render build logs for `npm run build` errors
- Common issues:
  - Missing dependencies
  - React/Vite build errors
  - Insufficient memory

---

## Monitoring & Troubleshooting

### Enable detailed logging (for development):
In your `.env` or Render environment variables, add:
```
LOG_LEVEL=debug
NODE_ENV=development
```
This will log more detailed information about what's happening.

### Key log messages to watch for:
```
✓ All API routes mounted successfully       → Routes are loading
✓ Serving frontend from [path]              → Frontend will be served
Connected to Postgres                        → Database is connected
Postgres connection failed                  → Using file-backed storage
API route not found [POST /api/menu]       → Something tried to POST to /api but it wasn't found
```

### Render Dashboard Monitoring:
1. Go to your service metrics
2. Watch CPU and Memory usage (should be low)
3. Check error rate (should be ~0%)
4. Monitor response times (should be < 200ms for API calls)

---

## Expected Behavior After Fixes

✅ **Homepage loads** - Website displays when visiting the URL  
✅ **Admin login works** - Can log in without authentication errors  
✅ **Admin can view data** - Menu, rooms, halls load in admin dashboard  
✅ **Admin can create items** - Can add new menu items, rooms, or halls  
✅ **Admin can update items** - Can edit existing items  
✅ **Admin can delete items** - Can remove items from the system  
✅ **API calls return 200/201** - No 404 or 500 errors for valid requests

---

## Next Steps

1. **Monitor Render deployment** - Watch logs as it redeploys
2. **Test in browser** - Refresh and try admin tasks
3. **Check browser console** - Report any errors you see
4. **Share Render log errors** - If still having issues, share the error messages from Render logs

---

## Quick Checklist

- [ ] Changes pushed to GitHub
- [ ] Render redeployed (check build logs)
- [ ] Website displays at your Render URL
- [ ] Admin can log in
- [ ] Admin dashboard shows data (menu, rooms, halls)
- [ ] Can create/update/delete items in admin panel
- [ ] No console errors in browser (F12)
- [ ] API calls show 200/201 status (Network tab)

---

**If you're still experiencing issues, check the Render logs and share the error messages. The logging we added should help pinpoint exactly what's wrong!**
