import {
  ImageFormat,
  MIME_BY_FORMAT,
  isHeic,
  isSvg,
  isTiff
} from './formats';

export type ConvertOptions = {
  format: ImageFormat;
  quality: number; // 0..1
  resize?: {
    width?: number;
    height?: number;
    keepAspectRatio?: boolean;
    percent?: number;
  };
};

export type ConvertResult = {
  blob: Blob;
  width: number;
  height: number;
  size: number;
};

async function loadImageBitmap(file: File | Blob): Promise<{ bitmap: HTMLImageElement; width: number; height: number; cleanup: () => void }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to load image'));
      el.src = url;
    });
    return {
      bitmap: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      cleanup: () => URL.revokeObjectURL(url)
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

async function decodeHeic(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default as (
    opts: { blob: Blob; toType?: string; quality?: number }
  ) => Promise<Blob | Blob[]>;
  const out = await heic2any({ blob: file, toType: 'image/png', quality: 0.95 });
  return Array.isArray(out) ? out[0] : out;
}

async function decodeSvg(file: File): Promise<Blob> {
  const text = await file.text();
  return new Blob([text], { type: 'image/svg+xml' });
}

export async function fileToDecodableBlob(file: File): Promise<Blob> {
  if (isHeic(file)) return decodeHeic(file);
  if (isSvg(file)) return decodeSvg(file);
  return file;
}

export async function getImageMeta(file: File): Promise<{ width: number; height: number }> {
  try {
    const decodable = await fileToDecodableBlob(file);
    const loaded = await loadImageBitmap(decodable);
    loaded.cleanup();
    return { width: loaded.width, height: loaded.height };
  } catch {
    return { width: 0, height: 0 };
  }
}

function computeSize(orig: { w: number; h: number }, resize: ConvertOptions['resize']) {
  if (!resize) return { w: orig.w, h: orig.h };
  if (resize.percent && resize.percent > 0) {
    return {
      w: Math.max(1, Math.round((orig.w * resize.percent) / 100)),
      h: Math.max(1, Math.round((orig.h * resize.percent) / 100))
    };
  }
  const keep = resize.keepAspectRatio !== false;
  let w = resize.width || orig.w;
  let h = resize.height || orig.h;
  if (keep) {
    const ratio = orig.w / orig.h;
    if (resize.width && !resize.height) h = Math.round(w / ratio);
    else if (resize.height && !resize.width) w = Math.round(h * ratio);
    else if (resize.width && resize.height) {
      // fit inside box
      const targetRatio = w / h;
      if (targetRatio > ratio) w = Math.round(h * ratio);
      else h = Math.round(w / ratio);
    }
  }
  return { w: Math.max(1, w), h: Math.max(1, h) };
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(`Encoder failed for ${mime}`))),
      mime,
      quality
    );
  });
}

async function imageToCanvas(blob: Blob, target: { w: number; h: number }): Promise<HTMLCanvasElement> {
  const loaded = await loadImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = target.w;
    canvas.height = target.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(loaded.bitmap, 0, 0, target.w, target.h);
    return canvas;
  } finally {
    loaded.cleanup();
  }
}

async function convertToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const w = canvas.width;
  const h = canvas.height;
  const orientation = w >= h ? 'l' : 'p';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h], hotfixes: ['px_scaling'] });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h);
  return pdf.output('blob');
}

export async function convertImage(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  const decodable = await fileToDecodableBlob(file);
  const loaded = await loadImageBitmap(decodable);
  const orig = { w: loaded.width, h: loaded.height };
  loaded.cleanup();
  const target = computeSize(orig, opts.resize);
  const canvas = await imageToCanvas(decodable, target);

  let blob: Blob;
  if (opts.format === 'pdf') {
    blob = await convertToPdf(canvas);
  } else if (opts.format === 'bmp') {
    // Many browsers don't support image/bmp encoding via toBlob, fall back to PNG inside .bmp wrapper not feasible;
    // We'll use a manual BMP encoder.
    blob = await canvasToBmp(canvas);
  } else if (opts.format === 'heic') {
    // HEIC encoding is not supported in browsers — fallback to JPG quietly
    blob = await canvasToBlob(canvas, 'image/jpeg', opts.quality);
  } else {
    const mime = MIME_BY_FORMAT[opts.format];
    blob = await canvasToBlob(canvas, mime, opts.quality);
  }

  return { blob, width: target.w, height: target.h, size: blob.size };
}

// Minimal 24-bit BMP encoder
async function canvasToBmp(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // File header
  view.setUint8(0, 0x42); view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);
  // DIB header
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const destRow = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const i = srcRow + x * 4;
      const o = destRow + x * 3;
      view.setUint8(o, data[i + 2]);
      view.setUint8(o + 1, data[i + 1]);
      view.setUint8(o + 2, data[i]);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

export async function fetchUrlAsFile(url: string): Promise<File> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Failed to fetch image');
  const blob = await res.blob();
  const name = (() => {
    try {
      const u = new URL(url);
      const p = u.pathname.split('/').pop() || 'image';
      return p.includes('.') ? p : `${p}.png`;
    } catch {
      return 'image.png';
    }
  })();
  return new File([blob], name, { type: blob.type || 'image/png' });
}
