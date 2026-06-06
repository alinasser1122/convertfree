declare module 'gif.js';

declare global {
  interface Window {
    ImageDecoder?: unknown;
  }
}

export {};
