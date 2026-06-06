export type ImageFormat =
  | 'jpg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'pdf'
  | 'heic'
  | 'bmp'
  | 'gif';

export const OUTPUT_FORMATS: ImageFormat[] = [
  'jpg',
  'png',
  'webp',
  'avif',
  'pdf',
  'bmp'
];

export const INPUT_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/avif',
  'image/tiff'
];

export const INPUT_EXTENSIONS =
  '.png,.jpg,.jpeg,.webp,.heic,.heif,.gif,.bmp,.svg,.avif,.tif,.tiff';

export const MIME_BY_FORMAT: Record<ImageFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  pdf: 'application/pdf',
  heic: 'image/heic',
  bmp: 'image/bmp',
  gif: 'image/gif'
};

export const EXT_BY_FORMAT: Record<ImageFormat, string> = {
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  pdf: 'pdf',
  heic: 'heic',
  bmp: 'bmp',
  gif: 'gif'
};

export function detectFormatFromName(name: string): ImageFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'heic';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.webp')) return 'webp';
  if (lower.endsWith('.avif')) return 'avif';
  if (lower.endsWith('.gif')) return 'gif';
  if (lower.endsWith('.bmp')) return 'bmp';
  return null;
}

export function isHeic(file: File): boolean {
  return (
    /heic|heif/i.test(file.type) ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

export function isSvg(file: File | string): boolean {
  if (typeof file === 'string') return /\.svg$/i.test(file);
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

export function isTiff(file: File): boolean {
  return /tiff?/i.test(file.type) || /\.(tif|tiff)$/i.test(file.name);
}
