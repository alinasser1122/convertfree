'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Loader2, Download, X, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { INPUT_EXTENSIONS } from '@/lib/formats';
import { fileToDecodableBlob } from '@/lib/imageConverter';
import { cn, downloadBlob, uniqueId } from '@/lib/utils';

type Item = {
  id: string;
  file: File;
  previewUrl: string;
};

const PAGE_SIZES = ['a4', 'letter', 'legal', 'a3', 'a5'] as const;
type PageSize = (typeof PAGE_SIZES)[number];

export function PdfTool() {
  const t = useTranslations('tools.pdf');
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [running, setRunning] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).map((file) => ({
      id: uniqueId(),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setItems((s) => [...s, ...arr]);
  };

  const remove = (id: string) => {
    setItems((s) => {
      const found = s.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return s.filter((x) => x.id !== id);
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    setItems((s) => {
      const i = s.findIndex((x) => x.id === id);
      if (i < 0) return s;
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const generate = async () => {
    if (items.length === 0) return;
    setRunning(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation, unit: 'pt', format: pageSize });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (i > 0) pdf.addPage(pageSize, orientation);
        const blob = await fileToDecodableBlob(it.file);
        const dataUrl = await blobToDataUrl(blob);
        const dims = await imgDims(dataUrl);
        const scale = Math.min(pageW / dims.w, pageH / dims.h);
        const w = dims.w * scale;
        const h = dims.h * scale;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        pdf.addImage(dataUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
      }
      const out = pdf.output('blob');
      downloadBlob(out, `freeconvertx-${Date.now()}.pdf`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-primary-400 transition-colors p-10 text-center cursor-pointer glass"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={INPUT_EXTENSIONS}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white shadow-glow">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-3 font-semibold">{t('addImages')}</p>
        <p className="text-sm text-muted">Reorder by moving items up and down</p>
      </div>

      {items.length > 0 && (
        <div className="card">
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div>
              <label className="label">{t('pageSize')}</label>
              <div className="grid grid-cols-5 gap-1">
                {PAGE_SIZES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPageSize(p)}
                    className={cn(
                      'rounded-lg px-2 py-1.5 text-xs font-bold uppercase',
                      pageSize === p
                        ? 'bg-gradient-primary text-white'
                        : 'bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t('orientation')}</label>
              <div className="grid grid-cols-2 gap-1">
                {(['p', 'l'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={cn(
                      'rounded-lg px-2 py-1.5 text-xs font-bold',
                      orientation === o
                        ? 'bg-gradient-primary text-white'
                        : 'bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10'
                    )}
                  >
                    {o === 'p' ? t('portrait') : t('landscape')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={generate} disabled={running} className="btn-primary w-full">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {running ? t('generating') : t('generate')}
              </button>
            </div>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <li key={it.id} className="flex gap-3 rounded-xl border border-slate-200 dark:border-white/10 p-2 bg-white/40 dark:bg-white/5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.previewUrl} alt={it.file.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i + 1}. {it.file.name}</div>
                  <div className="mt-2 flex items-center gap-1">
                    <button onClick={() => move(it.id, -1)} className="btn-ghost !p-1" aria-label={t('moveUp')}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(it.id, 1)} className="btn-ghost !p-1" aria-label={t('moveDown')}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(it.id)} className="btn-ghost !p-1 ms-auto text-rose-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(blob);
  });
}

function imgDims(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve({ w: i.naturalWidth, h: i.naturalHeight });
    i.onerror = () => reject(new Error('load failed'));
    i.src = src;
  });
}
