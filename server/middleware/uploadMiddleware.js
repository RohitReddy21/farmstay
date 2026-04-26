const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

const hasCloudinaryConfig =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

let storage;
if (hasCloudinaryConfig) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            const isVideo = file.mimetype.startsWith('video');
            return {
                folder: 'farmstays',
                resource_type: 'auto', // 'auto' allows images, videos, and raw files
                allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm'] : ['jpg', 'png', 'jpeg', 'webp'],
                transformation: isVideo ? [] : [{ width: 1000, height: 750, crop: 'limit' }]
            };
        },
    });
} else {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            const safeExt = ext && ext.length <= 10 ? ext : '';
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
        }
    });
    console.warn('Cloudinary env vars not set; using local disk uploads at /uploads');
}

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024 // Increased to 50MB for videos
    }
});

module.exports = upload;
