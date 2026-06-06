'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Loader2, Download, RotateCcw } from 'lucide-react';
import { convertImage, getImageMeta } from '@/lib/imageConverter';
import { INPUT_EXTENSIONS } from '@/lib/formats';
import { downloadBlob, cn, basename, formatBytes } from '@/lib/utils';

export function ResizeTool() {
  const t = useTranslations('tools.resize');
  const tc = useTranslations('converter');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [orig, setOrig] = useState<{ w: number; h: number; size: number }>({ w: 0, h: 0, size: 0 });
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [percent, setPercent] = useState(75);
  const [keep, setKeep] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    const meta = await getImageMeta(f);
    setOrig({ w: meta.width, h: meta.height, size: f.size });
    setWidth(meta.width || 1920);
    setHeight(meta.height || 1080);
    e.target.value = '';
  };

  const onApply = async () => {
    if (!file) return;
    setRunning(true);
    try {
      const result = await convertImage(file, {
        format: 'png',
        quality: 0.95,
        resize: mode === 'percent'
          ? { percent }
          : { width, height, keepAspectRatio: keep }
      });
      downloadBlob(result.blob, `${basename(file.name)}-resized.png`);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setOrig({ w: 0, h: 0, size: 0 });
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-primary-400 transition-colors p-12 text-center cursor-pointer glass"
        >
          <input
            ref={inputRef}
            type="file"
            accept={INPUT_EXTENSIONS}
            onChange={onPick}
            className="hidden"
          />
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white shadow-glow">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Drop an image to resize</p>
          <p className="text-sm text-muted">PNG, JPG, WEBP, HEIC, AVIF, GIF, BMP</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 aspect-video grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview!} alt={file.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="mt-3 text-sm text-muted">
              <div className="truncate font-medium text-slate-700 dark:text-slate-200">{file.name}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <span>{orig.w}×{orig.h}</span>
                <span>{formatBytes(orig.size)}</span>
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="label">{t('mode')}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['pixels', 'percent'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm font-medium border transition-all',
                      mode === m
                        ? 'bg-gradient-primary text-white border-transparent shadow-md shadow-primary-500/30'
                        : 'bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10'
                    )}
                  >
                    {m === 'pixels' ? t('modePixels') : t('modePercent')}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'pixels' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{tc('width')}</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{tc('height')}</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={keep}
                    onChange={(e) => setKeep(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600"
                  />
                  {tc('keepRatio')}
                </label>
              </div>
            ) : (
              <div>
                <label className="label flex items-center justify-between">
                  {t('percent')}
                  <span className="font-bold text-primary-600 dark:text-primary-400">{percent}%</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={200}
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-muted">
                  → {Math.round((orig.w * percent) / 100)}×{Math.round((orig.h * percent) / 100)}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onApply} disabled={running} className="btn-primary flex-1">
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
