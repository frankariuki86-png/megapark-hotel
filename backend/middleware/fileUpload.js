const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Logger for debugging
const logger = require('../services/logger');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('[fileUpload] Created uploads directory:', uploadDir);
}

const optimizedDir = path.join(__dirname, '..', 'uploads', 'optimized');
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
  logger.info('[fileUpload] Created optimized directory:', optimizedDir);
}

// Verify directories are writable
try {
  fs.accessSync(uploadDir, fs.constants.W_OK);
  logger.info('[fileUpload] Uploads directory is writable');
} catch (err) {
  logger.error('[fileUpload] Uploads directory is NOT writable:', err.message);
}

try {
  fs.accessSync(optimizedDir, fs.constants.W_OK);
  logger.info('[fileUpload] Optimized directory is writable');
} catch (err) {
  logger.error('[fileUpload] Optimized directory is NOT writable:', err.message);
}

// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info('[fileUpload] Destination callback - saving to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    logger.info('[fileUpload] Generated filename:', uniqueName);
    cb(null, uniqueName);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  logger.info('[fileUpload] File check - name:', file.originalname, 'mimetype:', file.mimetype);
  if (allowedMimes.includes(file.mimetype)) {
    logger.info('[fileUpload] File accepted:', file.originalname);
    cb(null, true);
  } else {
    logger.warn('[fileUpload] File rejected - invalid mimetype:', file.mimetype);
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Optimize image using Sharp
 * Resizes, converts to WebP, and compresses
 */
const optimizeImage = async (filePath, maxWidth = 1200, maxHeight = 1200) => {
  try {
    const filename = path.basename(filePath);
    const optimizedPath = path.join(optimizedDir, `optimized-${filename}.webp`);
    
    logger.info('[fileUpload] Starting optimization - input:', filePath);
    logger.info('[fileUpload] Optimized output path:', optimizedPath);

    // Verify input file exists before optimization
    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file does not exist: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    logger.info('[fileUpload] Input file size:', fileStats.size, 'bytes');

    await sharp(filePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    // Verify optimized file was created
    if (!fs.existsSync(optimizedPath)) {
      throw new Error(`Optimized file was not created: ${optimizedPath}`);
    }

    const optimizedStats = fs.statSync(optimizedPath);
    logger.info('[fileUpload] Optimization successful - output size:', optimizedStats.size, 'bytes');

    // Clean up original uploaded file
    try {
      fs.unlinkSync(filePath);
      logger.info('[fileUpload] Cleaned up temporary file:', filePath);
    } catch (err) {
      logger.warn('[fileUpload] Could not delete temporary file:', err.message);
    }

    return {
      success: true,
      originalPath: filePath,
      optimizedPath,
      optimizedUrl: `/uploads/optimized/optimized-${filename}.webp`
    };
  } catch (error) {
    logger.error('[fileUpload] Optimization error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Middleware: Upload single image
 */
const uploadSingleImage = upload.single('image');

/**
 * Middleware: Upload single image with optimization
 */
const uploadAndOptimizeImage = async (req, res, next) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      logger.error('[fileUpload] Single upload error:', err.message);
      return res.status(400).json({
        error: 'File upload failed',
        message: err.message
      });
    }

    if (!req.file) {
      logger.info('[fileUpload] No file provided, continuing');
      return next();
    }

    try {
      const result = await optimizeImage(req.file.path);
      if (result.success) {
        req.file.optimizedUrl = result.optimizedUrl;
        logger.info('[fileUpload] Single image optimized:', result.optimizedUrl);
      } else {
        logger.error('[fileUpload] Single image optimization failed:', result.error);
        throw new Error(result.error);
      }
      next();
    } catch (error) {
      logger.error('[fileUpload] Single image processing error:', error.message);
      return res.status(500).json({
        error: 'Image optimization failed',
        message: error.message
      });
    }
  });
};

/**
 * Middleware: Upload multiple images (up to 5)
 */
const uploadMultipleImages = upload.array('images', 5);

/**
 * Middleware: Upload multiple images with optimization
 */
const uploadAndOptimizeMultipleImages = async (req, res, next) => {
  uploadMultipleImages(req, res, async (err) => {
    if (err) {
      logger.error('[fileUpload] Multiple upload error:', err.message);
      return res.status(400).json({
        error: 'File upload failed',
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      logger.info('[fileUpload] No files provided');
      return next();
    }

    logger.info('[fileUpload] Processing', req.files.length, 'files');

    try {
      const optimizedFiles = [];
      for (const file of req.files) {
        logger.info('[fileUpload] Processing file:', file.originalname, 'size:', file.size);
        const result = await optimizeImage(file.path);
        if (result.success) {
          optimizedFiles.push({
            originalFile: file,
            optimizedUrl: result.optimizedUrl
          });
          logger.info('[fileUpload] File optimized successfully:', result.optimizedUrl);
        } else {
          logger.error('[fileUpload] Failed to optimize file:', file.originalname, result.error);
          // Continue processing other files, don't fail on one bad file
        }
      }
      req.optimizedFiles = optimizedFiles;
      logger.info('[fileUpload] Completed processing', optimizedFiles.length, 'files out of', req.files.length);
      next();
    } catch (error) {
      logger.error('[fileUpload] Multiple image processing error:', error.message);
      return res.status(500).json({
        error: 'Image optimization failed',
        message: error.message
      });
    }
  });
};

/**
 * Validate image URL format
 */
const validateImageUrl = (url) => {
  if (!url) return { valid: false, error: 'URL is required' };
  
  try {
    new URL(url);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const lowerUrl = url.toLowerCase();
    const hasValidExtension = imageExtensions.some(ext => lowerUrl.includes(ext));
    
    if (!hasValidExtension) {
      return { valid: false, error: 'URL must point to an image file' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

module.exports = {
  uploadSingleImage,
  uploadAndOptimizeImage,
  uploadMultipleImages,
  uploadAndOptimizeMultipleImages,
  optimizeImage,
  validateImageUrl
};
