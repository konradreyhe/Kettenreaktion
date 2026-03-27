declare module 'gifenc' {
  type Palette = number[][];

  interface FrameOptions {
    palette: Palette;
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
  }

  interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: FrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    buffer: ArrayBuffer;
    stream: unknown;
  }

  export function GIFEncoder(): Encoder;
  export function quantize(rgba: Uint8ClampedArray, maxColors: number, options?: Record<string, unknown>): Palette;
  export function applyPalette(rgba: Uint8ClampedArray, palette: Palette, format?: string): Uint8Array;
  export function nearestColor(palette: Palette, r: number, g: number, b: number): number[];
  export function nearestColorIndex(palette: Palette, r: number, g: number, b: number): number;
  export function nearestColorIndexWithDistance(palette: Palette, r: number, g: number, b: number): [number, number];
  export function prequantize(rgba: Uint8ClampedArray, options?: Record<string, unknown>): Uint8ClampedArray;
  export function snapColorsToPalette(palette: Palette, knownColors: number[][], threshold?: number): void;
}
