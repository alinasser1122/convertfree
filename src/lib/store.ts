'use client';

import { create } from 'zustand';
import { ImageFormat } from './formats';

export type FileStatus = 'pending' | 'processing' | 'done' | 'error';

export type ConvertFile = {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  status: FileStatus;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  outputName?: string;
  error?: string;
};

type State = {
  files: ConvertFile[];
  format: ImageFormat;
  quality: number;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  keepRatio: boolean;
  renameEnabled: boolean;
  renamePattern: string;

  addFiles: (newFiles: ConvertFile[]) => void;
  updateFile: (id: string, patch: Partial<ConvertFile>) => void;
  removeFile: (id: string) => void;
  clear: () => void;

  setFormat: (f: ImageFormat) => void;
  setQuality: (q: number) => void;
  setResizeEnabled: (b: boolean) => void;
  setResizeWidth: (n: number) => void;
  setResizeHeight: (n: number) => void;
  setKeepRatio: (b: boolean) => void;
  setRenameEnabled: (b: boolean) => void;
  setRenamePattern: (s: string) => void;
};

export const useConverterStore = create<State>((set) => ({
  files: [],
  format: 'webp',
  quality: 0.9,
  resizeEnabled: false,
  resizeWidth: 1920,
  resizeHeight: 1080,
  keepRatio: true,
  renameEnabled: false,
  renamePattern: 'image-{n}',

  addFiles: (newFiles) => set((s) => ({ files: [...s.files, ...newFiles] })),
  updateFile: (id, patch) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...patch } : f))
    })),
  removeFile: (id) =>
    set((s) => {
      const file = s.files.find((f) => f.id === id);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
      return { files: s.files.filter((f) => f.id !== id) };
    }),
  clear: () =>
    set((s) => {
      s.files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      });
      return { files: [] };
    }),

  setFormat: (format) => set({ format }),
  setQuality: (quality) => set({ quality }),
  setResizeEnabled: (resizeEnabled) => set({ resizeEnabled }),
  setResizeWidth: (resizeWidth) => set({ resizeWidth }),
  setResizeHeight: (resizeHeight) => set({ resizeHeight }),
  setKeepRatio: (keepRatio) => set({ keepRatio }),
  setRenameEnabled: (renameEnabled) => set({ renameEnabled }),
  setRenamePattern: (renamePattern) => set({ renamePattern })
}));
