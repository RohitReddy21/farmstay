const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

const hasCloudinaryConfig =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

let storage;
if (hasCloudinaryConfig) {
    storage = {
        _handleFile: async (req, file, cb) => {
            const isVideo = file.mimetype.startsWith('video');
            const uploadOptions = {
                folder: 'farmstays',
                resource_type: 'auto',
                allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm'] : ['jpg', 'png', 'jpeg', 'webp'],
                transformation: isVideo ? undefined : [{ width: 1000, height: 750, crop: 'limit' }]
            };

            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) return cb(error);

                cb(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                    size: result.bytes,
                    mimetype: file.mimetype,
                    originalname: file.originalname,
                    cloudinary: result
                });
            });

            file.stream.pipe(uploadStream);
        },

        _removeFile: (req, file, cb) => {
            if (!file.filename) return cb(null);

            const resourceType = file.cloudinary?.resource_type || 'image';
            cloudinary.uploader.destroy(file.filename, { resource_type: resourceType }, (error) => cb(error));
        }
    };
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
