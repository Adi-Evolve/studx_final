/**
 * Image Optimization Utility
 * Compresses and resizes images before upload to save storage and improve performance
 */

/**
 * Compress and resize an image file
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @param {number} options.maxWidth - Maximum width (default: 1200)
 * @param {number} options.maxHeight - Maximum height (default: 800)
 * @param {number} options.quality - Quality 0-1 (default: 0.8)
 * @param {string} options.outputFormat - Output format 'jpeg' or 'webp' (default: 'jpeg')
 * @returns {Promise<File>} - Optimized image file
 */
export async function optimizeImage(file, options = {}) {
    const {
        maxWidth = 1200,
        maxHeight = 800,
        quality = 0.8,
        outputFormat = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            // Calculate new dimensions
            const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    // Create new file with compressed data
                    const optimizedFile = new File(
                        [blob], 
                        `optimized_${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`,
                        {
                            type: `image/${outputFormat}`,
                            lastModified: Date.now()
                        }
                    );

                    resolve(optimizedFile);
                },
                `image/${outputFormat}`,
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // Calculate scaling factor
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale

    width = Math.round(originalWidth * scale);
    height = Math.round(originalHeight * scale);

    return { width, height };
}

/**
 * Create multiple sizes of an image for responsive design
 * @param {File} file - Original image file
 * @param {Array} sizes - Array of size objects [{width, height, name}]
 * @returns {Promise<Array>} - Array of optimized files
 */
export async function createResponsiveImages(file, sizes = []) {
    const defaultSizes = [
        { width: 300, height: 200, name: 'thumbnail', quality: 0.7 },
        { width: 600, height: 400, name: 'medium', quality: 0.8 },
        { width: 1200, height: 800, name: 'large', quality: 0.85 }
    ];

    const sizesToProcess = sizes.length > 0 ? sizes : defaultSizes;
    const promises = sizesToProcess.map(async (size) => {
        const optimized = await optimizeImage(file, {
            maxWidth: size.width,
            maxHeight: size.height,
            quality: size.quality || 0.8,
            outputFormat: 'jpeg'
        });
        
        return {
            file: optimized,
            size: size.name,
            dimensions: { width: size.width, height: size.height }
        };
    });

    return Promise.all(promises);
}

/**
 * Get image file size in human readable format
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImage(file, options = {}) {
    const {
        maxSizeInMB = 10,
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        minWidth = 100,
        minHeight = 100
    } = options;

    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        errors.push(`File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${maxSizeInMB}MB`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(file, size = 150) {
    return optimizeImage(file, {
        maxWidth: size,
        maxHeight: size,
        quality: 0.7,
        outputFormat: 'jpeg'
    });
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(files, options = {}) {
    const results = [];
    
    for (const file of files) {
        try {
            const validation = validateImage(file, options);
            if (!validation.isValid) {
                results.push({
                    original: file,
                    optimized: null,
                    error: validation.errors.join(', '),
                    success: false
                });
                continue;
            }

            const optimized = await optimizeImage(file, options);
            const compressionRatio = ((file.size - optimized.size) / file.size * 100).toFixed(1);
            
            results.push({
                original: file,
                optimized,
                originalSize: formatFileSize(file.size),
                optimizedSize: formatFileSize(optimized.size),
                compressionRatio: `${compressionRatio}%`,
                success: true
            });
        } catch (error) {
            results.push({
                original: file,
                optimized: null,
                error: error.message,
                success: false
            });
        }
    }
    
    return results;
}
