'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Loader2, Download, FileArchive } from 'lucide-react';
import { cn, downloadBlob, basename, uniqueId } from '@/lib/utils';

type Frame = {
  id: string;
  dataUrl: string;
  blob: Blob;
};

export function GifTool() {
  const t = useTranslations('tools.gif');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [running, setRunning] = useState(false);

  const reset = () => {
    setFile(null);
    setFrames([]);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFrames([]);
    e.target.value = '';
  };

  const extract = async () => {
    if (!file) return;
    setRunning(true);
    setFrames([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const list = await decodeGifFrames(new Uint8Array(arrayBuffer));
      const out: Frame[] = [];
      for (const { canvas } of list) {
        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('blob failed'))),
            format === 'png' ? 'image/png' : 'image/jpeg',
            0.92
          )
        );
        const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.92);
        out.push({ id: uniqueId(), dataUrl, blob });
      }
      setFrames(out);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const downloadZip = async () => {
    if (frames.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const stem = file ? basename(file.name) : 'frames';
    frames.forEach((f, i) => {
      zip.file(`${stem}-${String(i + 1).padStart(3, '0')}.${format}`, f.blob);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${stem}-frames.zip`);
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
            accept=".gif,image/gif"
            onChange={onPick}
            className="hidden"
          />
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white shadow-glow">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Drop a GIF</p>
          <p className="text-sm text-muted">Extract every frame as PNG or JPG</p>
        </div>
      ) : (
        <div className="card space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <div className="font-semibold">{file.name}</div>
              {frames.length > 0 && (
                <div className="text-muted">{t('framesFound', { count: frames.length })}</div>
              )}
            </div>
            <div className="ms-auto flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 p-1 text-xs">
                {(['png', 'jpg'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-semibold uppercase',
                      format === f ? 'bg-gradient-primary text-white' : ''
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={extract} disabled={running} className="btn-primary text-sm">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {running ? t('extracting') : t('extract')}
              </button>
              {frames.length > 0 && (
                <button onClick={downloadZip} className="btn-secondary text-sm">
                  <FileArchive className="h-4 w-4" />
                  {t('downloadZip')}
                </button>
              )}
              <button onClick={reset} className="btn-ghost text-sm">
                Reset
              </button>
            </div>
          </div>

          {frames.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
              {frames.map((f, i) => (
                <div key={f.id} className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.dataUrl} alt={`frame ${i + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute top-1 start-1 chip bg-black/60 text-white text-[10px]">{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Minimal GIF frame decoder using <canvas> + ImageBitmap of the static GIF.
// Browsers natively decode all frames when rendering a GIF in <img>, but to access them
// programmatically we rely on the `omggif` algorithm here adapted as a tiny inline parser.
// To keep dependencies small, we use a pragmatic approach: render the GIF in a hidden
// <img>, and use the standard ImageDecoder API when available.
async function decodeGifFrames(bytes: Uint8Array): Promise<{ canvas: HTMLCanvasElement; delay: number }[]> {
  // Use ImageDecoder if available (Chrome/Edge)
  // @ts-expect-error - ImageDecoder may not be typed
  if (typeof ImageDecoder !== 'undefined') {
    try {
      // @ts-expect-error
      const decoder = new ImageDecoder({ data: bytes, type: 'image/gif' });
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const frameCount = track?.frameCount ?? 1;
      const results: { canvas: HTMLCanvasElement; delay: number }[] = [];
      for (let i = 0; i < frameCount; i++) {
        const { image } = await decoder.decode({ frameIndex: i });
        const canvas = document.createElement('canvas');
        canvas.width = image.displayWidth;
        canvas.height = image.displayHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(image as unknown as CanvasImageSource, 0, 0);
        image.close?.();
        results.push({ canvas, delay: 0 });
      }
      return results;
    } catch (e) {
      // fall through
    }
  }
  // Fallback: parse manually
  return parseGifFramesFallback(bytes);
}

// Tiny GIF parser fallback. Renders each composited frame into a canvas.
function parseGifFramesFallback(data: Uint8Array): { canvas: HTMLCanvasElement; delay: number }[] {
  const frames: { canvas: HTMLCanvasElement; delay: number }[] = [];
  let pos = 0;
  const u8 = data;
  const readU8 = () => u8[pos++];
  const readU16 = () => {
    const v = u8[pos] | (u8[pos + 1] << 8);
    pos += 2;
    return v;
  };
  const readBytes = (n: number) => {
    const out = u8.subarray(pos, pos + n);
    pos += n;
    return out;
  };
  const skipSubBlocks = () => {
    let len = readU8();
    while (len !== 0) {
      pos += len;
      len = readU8();
    }
  };

  // Header
  const sig = String.fromCharCode(...readBytes(6));
  if (!sig.startsWith('GIF')) throw new Error('Not a GIF');
  const width = readU16();
  const height = readU16();
  const packed = readU8();
  const gctSize = packed & 0x07;
  const gctFlag = (packed & 0x80) !== 0;
  readU8(); // bg
  readU8(); // pixel aspect
  let globalColorTable: Uint8Array | null = null;
  if (gctFlag) globalColorTable = readBytes(3 * (1 << (gctSize + 1)));

  const composite = document.createElement('canvas');
  composite.width = width;
  composite.height = height;
  const cctx = composite.getContext('2d', { willReadFrequently: true });
  if (!cctx) throw new Error('No 2D context');
  cctx.clearRect(0, 0, width, height);

  let gceDelay = 0;
  let transparentIndex = -1;
  let disposal = 0;

  while (pos < u8.length) {
    const block = readU8();
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      const ext = readU8();
      if (ext === 0xf9) {
        readU8(); // block size = 4
        const flags = readU8();
        gceDelay = readU16() * 10;
        const trans = readU8();
        disposal = (flags >> 2) & 0x07;
        transparentIndex = flags & 0x01 ? trans : -1;
        readU8(); // terminator
      } else {
        skipSubBlocks();
      }
    } else if (block === 0x2c) {
      const left = readU16();
      const top = readU16();
      const w = readU16();
      const h = readU16();
      const p = readU8();
      const lctFlag = (p & 0x80) !== 0;
      const interlace = (p & 0x40) !== 0;
      const lctSize = p & 0x07;
      const colorTable = lctFlag ? readBytes(3 * (1 << (lctSize + 1))) : globalColorTable;
      if (!colorTable) throw new Error('No color table');
      const lzwMinSize = readU8();
      const compressed: number[] = [];
      let len = readU8();
      while (len !== 0) {
        for (let i = 0; i < len; i++) compressed.push(u8[pos + i]);
        pos += len;
        len = readU8();
      }
      const indices = lzwDecode(new Uint8Array(compressed), lzwMinSize, w * h);
      const pixels = new Uint8ClampedArray(w * h * 4);
      const order = interlace ? interlacedOrder(h) : null;
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const dst = order ? order[i] * w : i;
        const o = dst * 4;
        if (idx === transparentIndex) {
          pixels[o + 3] = 0;
        } else {
          const c = idx * 3;
          pixels[o] = colorTable[c];
          pixels[o + 1] = colorTable[c + 1];
          pixels[o + 2] = colorTable[c + 2];
          pixels[o + 3] = 255;
        }
      }
      const imageData = new ImageData(pixels, w, h);
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = w;
      frameCanvas.height = h;
      frameCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
      cctx.drawImage(frameCanvas, left, top);
      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      out.getContext('2d')!.drawImage(composite, 0, 0);
      frames.push({ canvas: out, delay: gceDelay });
      if (disposal === 2) cctx.clearRect(left, top, w, h);
    } else {
      // unknown, abort
      break;
    }
  }
  return frames;
}

function interlacedOrder(h: number): number[] {
  const order: number[] = [];
  for (let y = 0; y < h; y += 8) order.push(y);
  for (let y = 4; y < h; y += 8) order.push(y);
  for (let y = 2; y < h; y += 4) order.push(y);
  for (let y = 1; y < h; y += 2) order.push(y);
  const flat: number[] = [];
  for (const y of order) flat.push(y);
  // expand to pixel mapping
  const pixelIndex: number[] = [];
  for (const y of flat) pixelIndex.push(y);
  return pixelIndex;
}

function lzwDecode(data: Uint8Array, minSize: number, pixelCount: number): Uint8Array {
  const out = new Uint8Array(pixelCount);
  let outPos = 0;
  const clearCode = 1 << minSize;
  const eoiCode = clearCode + 1;
  let codeSize = minSize + 1;
  let nextCode = eoiCode + 1;
  let dict: number[][] = [];
  const resetDict = () => {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict.push([i]);
    dict.push([]);
    dict.push([]);
    nextCode = eoiCode + 1;
    codeSize = minSize + 1;
  };
  resetDict();

  let bitBuf = 0;
  let bitCount = 0;
  let bytePos = 0;
  let prev: number[] | null = null;

  while (outPos < pixelCount) {
    while (bitCount < codeSize && bytePos < data.length) {
      bitBuf |= data[bytePos++] << bitCount;
      bitCount += 8;
    }
    if (bitCount < codeSize) break;
    const code = bitBuf & ((1 << codeSize) - 1);
    bitBuf >>= codeSize;
    bitCount -= codeSize;

    if (code === clearCode) {
      resetDict();
      prev = null;
      continue;
    }
    if (code === eoiCode) break;

    let entry: number[];
    if (code < dict.length) {
      entry = dict[code];
    } else if (prev) {
      entry = [...prev, prev[0]];
    } else {
      break;
    }
    for (const px of entry) {
      if (outPos < pixelCount) out[outPos++] = px;
    }
    if (prev) {
      dict.push([...prev, entry[0]]);
      if (dict.length === 1 << codeSize && codeSize < 12) codeSize++;
    }
    prev = entry;
  }
  return out;
}
