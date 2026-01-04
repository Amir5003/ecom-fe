/**
 * Image Compression Utility
 * Compresses images to reduce file size while maintaining reasonable quality
 */

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {number} maxSize - Maximum file size in KB (default: 50)
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} maxHeight - Maximum height in pixels (default: 1200)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, maxSize = 50, maxWidth = 1200, maxHeight = 1200) => {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions are too large
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.9 and reduce until file size is acceptable
        let quality = 0.9;
        let compressedFile;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              const fileSizeInKB = blob.size / 1024;

              if (fileSizeInKB <= maxSize || quality <= 0.1) {
                // Create a new File from Blob
                compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: file.lastModified,
                });

                console.log(
                  `Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${fileSizeInKB.toFixed(2)}KB (Quality: ${(quality * 100).toFixed(0)}%)`
                );
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Build image URL dynamically based on current hostname
 * @param {string} imagePath - Image path from API (e.g., "uploads/1767541632769.png")
 * @returns {string} - Full image URL
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Build URL dynamically from current hostname
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const port = typeof window !== 'undefined' ? window.location.port : '5001';

  // If on localhost, use the API port (5001)
  // If on production, use current port
  const baseUrl = hostname === 'localhost' 
    ? `${protocol}//${hostname}:5001`
    : `${protocol}//${hostname}${port ? ':' + port : ''}`;

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  return `${baseUrl}/${cleanPath}`;
};
