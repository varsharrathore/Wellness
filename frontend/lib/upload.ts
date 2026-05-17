// Base URL for the backend server (where uploads are served from)
// This reads from the env var set in .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Build the full URL for a product image or video filename.
 * e.g. getUploadUrl('images-123.png') => 'http://localhost:5000/uploads/images-123.png'
 */
export function getUploadUrl(filename: string): string {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  // Already a full path like /uploads/categories/xxx.avif
  if (filename.startsWith('/uploads/')) return `${BASE_URL}${filename}`;
  return `${BASE_URL}/uploads/${filename}`;
}
