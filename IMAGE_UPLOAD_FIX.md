# Image Upload Fix - Room Creation

## Problem
Room creation form had inconsistencies with image uploads:
- Images were being read as base64 data URLs and sent as JSON
- No file upload middleware was being used on the backend
- Image URLs were not being properly saved or returned
- Images were not appearing consistently in the admin dashboard

## Root Cause
The frontend was converting images to base64 strings and embedding them directly in the JSON payload. The backend had no multipart/form-data handling for image uploads, so it was storing the bloated base64 strings directly in the database.

## Solution Overview
Implemented proper file upload handling using:
1. **Frontend**: Modified to send images as FormData with actual File objects
2. **Backend**: Updated room endpoints to use fileUpload middleware for image optimization
3. **Static Serving**: Added `/uploads` endpoint to serve uploaded images

## Changes Made

### 1. Backend Router Updates (`backend/routes/rooms.js`)

#### Imports
```javascript
const { uploadAndOptimizeMultipleImages } = require('../middleware/fileUpload');
```

#### POST /api/rooms (Create)
- Added `uploadAndOptimizeMultipleImages` middleware
- Middleware processes uploaded images using Sharp for optimization
- Returns optimized image URLs (WebP format) that are stored in the database
- Fallback: if no files uploaded, accepts images array from request body

**Key Changes:**
```javascript
router.post('/', authenticate, uploadAndOptimizeMultipleImages, async (req, res) => {
  // ... Handles req.optimizedFiles array with image URLs
  if (req.optimizedFiles && req.optimizedFiles.length > 0) {
    const uploadedImageUrls = req.optimizedFiles.map(f => f.optimizedUrl);
    body.images = uploadedImageUrls;
  }
  // ... Rest of creation logic
});
```

#### PUT /api/rooms/:id (Update)
- Same multipart/form-data support for updating room images
- Allows partial image updates or replacing all images

### 2. Frontend Service Updates (`frontend/src/services/adminService.js`)

#### roomsService.create(room, imageFiles)
- Now accepts `imageFiles` parameter (array of File objects)
- Builds FormData with room data and file uploads
- Sends with proper Authorization header but lets browser set multipart/form-data boundary

**Key Changes:**
```javascript
async create(room, imageFiles = []) {
  const formData = new FormData();
  
  // Add room fields
  formData.append('name', payload.name);
  formData.append('pricePerNight', payload.pricePerNight);
  // ... other fields
  
  // Add image files
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      formData.append('images', file);
    }
  }
  
  // Send without Content-Type header (browser will set it)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
}
```

#### roomsService.update(id, room, imageFiles)
- Same FormData approach for updates
- Allows updating room info with new images

### 3. Frontend Component Updates (`frontend/src/components/RoomsManagement.jsx`)

#### handleSubmit
Updated to pass `imageFiles` to service methods:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingId) {
      await roomsService.update(editingId, formData, imageFiles);
    } else {
      await roomsService.create(formData, imageFiles);
    }
    // ... rest
  }
};
```

### 4. Backend Main Server (`backend/index.js`)

#### Static File Serving
Added uploads directory configuration:
```javascript
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  etag: false
}));
```

This enables serving of uploaded images at `/uploads/optimized/...` URLs.

## Image Processing Pipeline

1. **Frontend**: User selects image files → stored in component state
2. **Form Submission**: FormData with room info and File objects sent to backend
3. **Multer Middleware**: Files received and temporarily stored in `/uploads`
4. **Sharp Optimization**: Images resized to max 1200x1200, converted to WebP at 80% quality
5. **Backend Handler**: Optimized image URLs stored in database
6. **Response**: Client receives room object with image URLs like `/uploads/optimized/optimized-1234567890.webp`
7. **Display**: Frontend can now display images using the returned URLs directly

## Benefits

✅ **Smaller Database**: Images not bloated with base64 strings  
✅ **Optimized Images**: All images converted to WebP and compressed  
✅ **Consistent Display**: Same image serving for new and existing rooms  
✅ **Better Performance**: Smaller uploads, faster downloads  
✅ **Scalable**: Works with both file-based and database storage  

## Testing Checklist

- [x] Backend accepts multipart/form-data on POST /api/rooms
- [x] Backend accepts multipart/form-data on PUT /api/rooms/:id
- [x] Frontend sends FormData with File objects
- [x] Images are optimized with Sharp middleware
- [x] Optimized URLs are returned in response
- [x] URLs are stored in database/JSON
- [x] /uploads endpoint serves images correctly
- [x] Images display in admin dashboard
- [x] Existing rooms continue to work

## Database Impact

**No migration needed** - Images are stored as URL strings just like before, but now they're:
- Much shorter URLs instead of full base64 strings
- Optimized WebP format instead of original image data
- Served from `/uploads` directory instead of embedded

## Fallback Behavior

If no files are uploaded:
- Service accepts images array from request body (for backward compatibility)
- Can still send base64 strings if needed (e.g., from external sources)
- Schema validation allows empty images array

## Future Improvements

- Add image removal endpoint to delete unused optimized files
- Implement image upload progress tracking
- Add image reordering UI
- Support for drag-and-drop uploads
- Thumbnail generation for faster admin UI loading
