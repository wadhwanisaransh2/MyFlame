// Polyfills for React Native
// This file provides necessary polyfills for React Native compatibility

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  // Simple TextEncoder/TextDecoder implementation for React Native
  const TextEncoderPolyfill = class {
    encoding: string = 'utf-8';
    encode(input: string): Uint8Array {
      const utf8 = unescape(encodeURIComponent(input));
      const bytes = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        bytes[i] = utf8.charCodeAt(i);
      }
      return bytes;
    }
    encodeInto(source: string, dest: Uint8Array): { read: number; written: number } {
      const bytes = this.encode(source);
      dest.set(bytes);
      return { read: source.length, written: bytes.length };
    }
  };
  (global as any).TextEncoder = TextEncoderPolyfill;

  const TextDecoderPolyfill = class {
    encoding: string = 'utf-8';
    fatal: boolean = false;
    ignoreBOM: boolean = false;

    constructor(encoding?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }) {
      if (encoding) this.encoding = encoding;
      if (options) {
        this.fatal = options.fatal || false;
        this.ignoreBOM = options.ignoreBOM || false;
      }
    }

    decode(input: Uint8Array): string {
      let result = '';
      for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input[i]);
      }
      return decodeURIComponent(escape(result));
    }
  };
  (global as any).TextDecoder = TextDecoderPolyfill;
}

// URL polyfill - React Native has these built-in, but just in case
if (!(global as any).URL) {
  (global as any).URL = URL;
  (global as any).URLSearchParams = URLSearchParams;
}

// Console polyfill for production
if (__DEV__ === false) {
  // Disable console logs in production
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Performance polyfill
if (typeof (global as any).performance === 'undefined') {
  const dummyMark = { startTime: 0, duration: 0, entryType: 'mark', name: '' };
  const dummyMeasure = { startTime: 0, duration: 0, entryType: 'measure', name: '' };

  (global as any).performance = {
    now: () => Date.now(),
    mark: (_name: string) => dummyMark,
    measure: (_name: string) => dummyMeasure
  };
}

// RequestAnimationFrame polyfill
if (typeof (global as any).requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = (callback: (time: number) => void) => {
    return setTimeout(() => callback(Date.now()), 16);
  };
}

if (typeof (global as any).cancelAnimationFrame === 'undefined') {
  (global as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// Geolocation polyfill
declare global {
  interface Navigator {
    geolocation: {
      getCurrentPosition: (success: (position: any) => void, error?: (error: any) => void, options?: any) => void;
      watchPosition: (success: (position: any) => void, error?: (error: any) => void, options?: any) => void;
      clearWatch: (id: number) => void;
    };
  }
}

if (typeof navigator !== 'undefined' && !navigator.geolocation) {
  navigator.geolocation = {
    getCurrentPosition: (_success: (position: any) => void) => {},
    watchPosition: (_success: (position: any) => void) => 0,
    clearWatch: (_id: number) => {}
  };
}

export {};