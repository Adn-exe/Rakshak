/**
 * Client-side image processing utilities.
 * Handles validation, compression, and data URL conversion.
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1600; // Resize to max 1600px
const COMPRESSION_QUALITY = 0.6;
const STORAGE_MAX_SIZE = 200 * 1024; // Target ~200KB for localStorage

/** Validate file type and size. */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'unsupportedFormat' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'fileTooLarge' };
  }
  return { valid: true };
}

/** Get image dimensions from a File. */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/** Compress and resize an image for localStorage storage. */
export function compressImageForStorage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { naturalWidth: w, naturalHeight: h } = img;

      // Resize if larger than max dimension
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);

      // Try JPEG first for better compression
      let dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);

      // If still too large, reduce quality further
      if (dataUrl.length > STORAGE_MAX_SIZE * 1.37) {
        // base64 overhead ~37%
        dataUrl = canvas.toDataURL('image/jpeg', 0.3);
      }

      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };
    img.onerror = () => {
      reject(new Error('Failed to compress image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/** Format file size for display. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
