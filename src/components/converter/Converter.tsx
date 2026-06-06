'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Link as LinkIcon,
  X,
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Settings2,
  Sparkles,
  FileArchive
} from 'lucide-react';
import { useConverterStore, ConvertFile } from '@/lib/store';
import {
  EXT_BY_FORMAT,
  INPUT_EXTENSIONS,
  OUTPUT_FORMATS,
  detectFormatFromName
} from '@/lib/formats';
import {
  convertImage,
  fetchUrlAsFile,
  getImageMeta
} from '@/lib/imageConverter';
import { basename, cn, downloadBlob, formatBytes, uniqueId } from '@/lib/utils';

export function Converter() {
  const t = useTranslations('converter');
  const tErr = useTranslations('converter.errors');
  const tStatus = useTranslations('converter.status');

  const s = useConverterStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [running, setRunning] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(true);

  const handleFiles = useCallback(
    async (list: FileList | File[]) => {
      const arr = Array.from(list);
      const accepted: ConvertFile[] = [];
      for (const file of arr) {
        const id = uniqueId();
        const previewUrl = URL.createObjectURL(file);
        accepted.push({
          id,
          file,
          previewUrl,
          width: 0,
          height: 0,
          status: 'pending'
        });
      }
      s.addFiles(accepted);
      // Compute meta async
      for (const it of accepted) {
        getImageMeta(it.file).then((m) => {
          s.updateFile(it.id, { width: m.width, height: m.height });
        });
      }
    },
    [s]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const onFetchUrl = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setUrlError(null);
    try {
      const file = await fetchUrlAsFile(url.trim());
      await handleFiles([file]);
      setUrl('');
    } catch (e) {
      setUrlError(tErr('urlFailed'));
    } finally {
      setFetching(false);
    }
  };

  const buildOutputName = (file: ConvertFile, index: number) => {
    const ext = EXT_BY_FORMAT[s.format];
    const orig = basename(file.file.name);
    if (s.renameEnabled && s.renamePattern) {
      const n = String(index + 1).padStart(2, '0');
      const stem = s.renamePattern
        .replace(/\{n\}/g, n)
        .replace(/\{name\}/g, orig);
      return `${stem}.${ext}`;
    }
    return `${orig}.${ext}`;
  };

  const convertOne = async (file: ConvertFile, index: number) => {
    s.updateFile(file.id, { status: 'processing', error: undefined });
    try {
      const result = await convertImage(file.file, {
        format: s.format,
        quality: Math.min(1, Math.max(0.01, s.quality)),
        resize: s.resizeEnabled
          ? {
              width: s.resizeWidth || undefined,
              height: s.resizeHeight || undefined,
              keepAspectRatio: s.keepRatio
            }
          : undefined
      });
      const resultUrl = URL.createObjectURL(result.blob);
      s.updateFile(file.id, {
        status: 'done',
        resultBlob: result.blob,
        resultUrl,
        resultSize: result.size,
        outputName: buildOutputName(file, index)
      });
    } catch (e) {
      console.error(e);
      s.updateFile(file.id, { status: 'error', error: tErr('convertFailed') });
    }
  };

  const convertAll = async () => {
    setRunning(true);
    try {
      let i = 0;
      for (const f of s.files) {
        if (f.status === 'done') {
          i++;
          continue;
        }
        await convertOne(f, i++);
      }
    } finally {
      setRunning(false);
    }
  };

  const downloadAllZip = async () => {
    const done = s.files.filter((f) => f.status === 'done' && f.resultBlob);
    if (done.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    done.forEach((f, idx) => {
      const name = f.outputName || buildOutputName(f, idx);
      zip.file(name, f.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `freeconvertx-${Date.now()}.zip`);
  };

  const hasFiles = s.files.length > 0;
  const doneCount = s.files.filter((f) => f.status === 'done').length;

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center cursor-pointer overflow-hidden',
          dragging
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-white/10 hover:border-primary-400 dark:hover:border-primary-500/50',
          'glass'
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={INPUT_EXTENSIONS}
          className="hidden"
          onChange={onPickFiles}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-primary blur-xl opacity-40 animate-pulse-slow" />
            <div className="relative grid h-16 w-16 place-items-center rounded-3xl bg-gradient-primary text-white shadow-glow">
              <Upload className="h-7 w-7" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">{t('dropTitle')}</h3>
          <p className="mt-1 text-sm text-muted max-w-md">{t('dropSubtitle')}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <ImageIcon className="h-4 w-4" />
              {t('browse')}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 card">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-semibold">{t('fromUrl')}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder={t('urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input flex-1"
          />
          <button onClick={onFetchUrl} disabled={fetching || !url.trim()} className="btn-secondary">
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            {fetching ? t('fetching') : t('fetch')}
          </button>
        </div>
        {urlError && (
          <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {urlError}
          </p>
        )}
      </div>

      <div className="mt-4 card">
        <button
          onClick={() => setShowOptions((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-semibold">{t('options')}</span>
          </div>
          <span className="text-xs text-muted">{showOptions ? '−' : '+'}</span>
        </button>

        <AnimatePresence initial={false}>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-5 mt-5 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="label">{t('outputFormat')}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {OUTPUT_FORMATS.map((f) => (
                      <button
                        key={f}
                        onClick={() => s.setFormat(f)}
                        className={cn(
                          'rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-wide transition-all',
                          s.format === f
                            ? 'bg-gradient-primary text-white shadow-md shadow-primary-500/30'
                            : 'bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label flex items-center justify-between">
                    <span>{t('quality')}</span>
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      {Math.round(s.quality * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(s.quality * 100)}
                    onChange={(e) => s.setQuality(Number(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="label">{t('rename')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.renameEnabled}
                      onChange={(e) => s.setRenameEnabled(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary-600"
                    />
                    <input
                      type="text"
                      placeholder="image-{n}"
                      value={s.renamePattern}
                      onChange={(e) => s.setRenamePattern(e.target.value)}
                      disabled={!s.renameEnabled}
                      className="input text-sm"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">{t('renamePattern')}</p>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.resizeEnabled}
                      onChange={(e) => s.setResizeEnabled(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary-600"
                    />
                    {t('resize')}
                  </label>
                  <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', !s.resizeEnabled && 'opacity-50 pointer-events-none')}>
                    <div>
                      <span className="text-xs text-muted">{t('width')}</span>
                      <input
                        type="number"
                        min={1}
                        value={s.resizeWidth}
                        onChange={(e) => s.setResizeWidth(Number(e.target.value))}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted">{t('height')}</span>
                      <input
                        type="number"
                        min={1}
                        value={s.resizeHeight}
                        onChange={(e) => s.setResizeHeight(Number(e.target.value))}
                        className="input mt-1"
                      />
                    </div>
                    <label className="flex items-end gap-2 text-sm pb-2">
                      <input
                        type="checkbox"
                        checked={s.keepRatio}
                        onChange={(e) => s.setKeepRatio(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary-600"
                      />
                      {t('keepRatio')}
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasFiles && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-sm text-muted">
              {s.files.length} files · {doneCount} done
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-ghost text-sm"
              >
                <Plus className="h-4 w-4" />
                {t('addMore')}
              </button>
              <button onClick={s.clear} className="btn-ghost text-sm">
                <Trash2 className="h-4 w-4" />
                {t('clearAll')}
              </button>
              {doneCount > 0 && (
                <button onClick={downloadAllZip} className="btn-secondary text-sm">
                  <FileArchive className="h-4 w-4" />
                  {t('downloadAll')}
                </button>
              )}
              <button
                onClick={convertAll}
                disabled={running}
                className="btn-primary text-sm"
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {running ? t('converting') : t('convertAll')}
              </button>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {s.files.map((f, idx) => (
                <FileCard
                  key={f.id}
                  file={f}
                  index={idx}
                  tStatus={tStatus}
                  tDownload={t('download')}
                  onRemove={() => s.removeFile(f.id)}
                  onDownload={() => {
                    if (f.resultBlob && f.outputName)
                      downloadBlob(f.resultBlob, f.outputName);
                  }}
                />
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function FileCard({
  file,
  index,
  tStatus,
  tDownload,
  onRemove,
  onDownload
}: {
  file: ConvertFile;
  index: number;
  tStatus: (k: string) => string;
  tDownload: string;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const orig = file.file.size;
  const out = file.resultSize ?? 0;
  const saving = orig > 0 && out > 0 ? Math.round((1 - out / orig) * 100) : 0;
  const fromFormat = detectFormatFromName(file.file.name);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="card !p-3"
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.previewUrl}
            alt={file.file.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{file.file.name}</div>
              <div className="mt-0.5 text-[11px] text-muted">
                {fromFormat?.toUpperCase() || 'IMG'} · {formatBytes(orig)}
                {file.width > 0 && ` · ${file.width}×${file.height}`}
              </div>
            </div>
            <button onClick={onRemove} className="text-muted hover:text-rose-500 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={file.status} label={tStatus(file.status)} />
            {file.status === 'done' && (
              <>
                <span className="text-[11px] text-muted">→ {formatBytes(out)}</span>
                {saving > 0 && (
                  <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    −{saving}%
                  </span>
                )}
                {saving < 0 && (
                  <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    +{Math.abs(saving)}%
                  </span>
                )}
              </>
            )}
          </div>

          {file.status === 'done' && (
            <button onClick={onDownload} className="mt-2 btn-secondary !py-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              {tDownload}
            </button>
          )}

          {file.error && (
            <p className="mt-2 text-[11px] text-rose-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {file.error}
            </p>
          )}
        </div>
      </div>
    </motion.li>
  );
}

function StatusBadge({ status, label }: { status: ConvertFile['status']; label: string }) {
  const map = {
    pending: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300',
    processing: 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300',
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    error: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  } as const;
  const icon = {
    pending: <ImageIcon className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    done: <CheckCircle2 className="h-3 w-3" />,
    error: <AlertCircle className="h-3 w-3" />
  } as const;
  return (
    <span className={cn('chip', map[status])}>
      {icon[status]}
      {label}
    </span>
  );
}
