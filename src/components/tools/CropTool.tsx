'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Upload, Loader2, Download, RotateCcw } from 'lucide-react';
import { INPUT_EXTENSIONS } from '@/lib/formats';
import { fileToDecodableBlob } from '@/lib/imageConverter';
import { cn, downloadBlob, basename } from '@/lib/utils';

const RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:4', value: 3 / 4 }
];

export function CropTool() {
  const t = useTranslations('tools.crop');
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [running, setRunning] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(basename(f.name));
    const decodable = await fileToDecodableBlob(f);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(decodable);
    setImgUrl(url);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixelCrop(areaPixels);
  }, []);

  const apply = async () => {
    if (!imgUrl || !pixelCrop) return;
    setRunning(true);
    try {
      const img = await loadImg(imgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(pixelCrop.width);
      canvas.height = Math.round(pixelCrop.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed'))), 'image/png')
      );
      downloadBlob(blob, `${fileName}-cropped.png`);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixelCrop(null);
  };

  return (
    <div className="space-y-6">
      {!imgUrl ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-primary-400 transition-colors p-12 text-center cursor-pointer glass"
        >
          <input ref={inputRef} type="file" accept={INPUT_EXTENSIONS} onChange={onPick} className="hidden" />
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white shadow-glow">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Drop an image to crop</p>
          <p className="text-sm text-muted">Drag, zoom, and trim with precision</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card !p-3">
            <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <Cropper
                image={imgUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>
            <div className="mt-3">
              <label className="label">Zoom</label>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="label">{t('ratio')}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {RATIOS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setAspect(r.value)}
                    className={cn(
                      'rounded-lg px-2 py-2 text-xs font-bold transition-all',
                      aspect === r.value
                        ? 'bg-gradient-primary text-white shadow-md shadow-primary-500/30'
                        : 'bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={apply} disabled={running || !pixelCrop} className="btn-primary flex-1">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t('apply')}
              </button>
              <button onClick={reset} className="btn-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load'));
    img.src = url;
  });
}
