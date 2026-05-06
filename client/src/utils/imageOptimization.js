const CLOUDINARY_UPLOAD_SEGMENT = '/upload/';

export const isCloudinaryImage = (url = '') => (
    typeof url === 'string'
    && url.includes('res.cloudinary.com')
    && url.includes(CLOUDINARY_UPLOAD_SEGMENT)
);

export const optimizeImageUrl = (url, options = {}) => {
    if (!url || !isCloudinaryImage(url)) return url;

    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
        gravity = 'auto'
    } = options;

    const transforms = [
        format && `f_${format}`,
        quality && `q_${quality}`,
        width && `w_${width}`,
        height && `h_${height}`,
        crop && `c_${crop}`,
        gravity && `g_${gravity}`
    ].filter(Boolean).join(',');

    if (!transforms) return url;
    return url.replace(CLOUDINARY_UPLOAD_SEGMENT, `${CLOUDINARY_UPLOAD_SEGMENT}${transforms}/`);
};

export const buildImageSrcSet = (url, widths = [], options = {}) => (
    widths
        .filter(Boolean)
        .map((width) => `${optimizeImageUrl(url, { ...options, width })} ${width}w`)
        .join(', ')
);
