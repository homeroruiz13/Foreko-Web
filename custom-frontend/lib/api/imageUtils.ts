const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ImageFormat {
  url: string;
  width: number;
  height: number;
  size?: number;
}

export interface ImageData {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

export function getImageUrl(image: ImageData | string, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'original'): string {
  if (typeof image === 'string') {
    // If it's already a complete URL, return as-is
    if (image.startsWith('http')) {
      return image;
    }
    // If it starts with /, it's a local path, no need to prefix API_BASE_URL
    if (image.startsWith('/')) {
      return image;
    }
    // Otherwise, treat as relative path from public directory
    return `/${image}`;
  }
  
  if (!image) return '';
  
  // If requesting a specific size and it exists in formats
  if (size !== 'original' && image.formats && image.formats[size]) {
    const formatUrl = image.formats[size]!.url;
    if (formatUrl.startsWith('http')) {
      return formatUrl;
    }
    if (formatUrl.startsWith('/')) {
      return formatUrl;
    }
    return `/${formatUrl}`;
  }
  
  // Fall back to original URL
  const originalUrl = image.url;
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }
  if (originalUrl.startsWith('/')) {
    return originalUrl;
  }
  return `/${originalUrl}`;
}

export function getImageAlt(image: ImageData | string): string {
  if (typeof image === 'string') return '';
  return image?.alternativeText || image?.caption || '';
}

export function getImageDimensions(image: ImageData, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'original'): { width: number; height: number } {
  if (size !== 'original' && image.formats && image.formats[size]) {
    const format = image.formats[size]!;
    return { width: format.width, height: format.height };
  }
  
  return { width: image.width, height: image.height };
}