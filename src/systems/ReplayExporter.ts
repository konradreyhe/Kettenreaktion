import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import type { ReplayFrame } from '../types/GameState';
import type { Level } from '../types/Level';

/** GIF output dimensions (downscaled for small file size). */
const GIF_WIDTH = 400;
const GIF_HEIGHT = 300;
const SCALE = GIF_WIDTH / GAME_WIDTH;

/** Frame delay in centiseconds (50ms = 5cs → ~20fps). */
const FRAME_DELAY = 5;

/** Skip every Nth frame to reduce GIF size while keeping motion readable. */
const FRAME_SKIP = 2;

/** Colors matching the game's procedural textures. */
const COLORS = {
  bg: '#1a1a2e',
  floor: '#556b5e',
  platform: '#4a5566',
  ramp: '#555577',
  target: '#ffcc00',
  targetGlow: 'rgba(255,221,0,0.15)',
  ball: '#6699cc',
  ballHighlight: '#88bbee',
  weight: '#4a5566',
  weightRing: '#3a4555',
  domino: '#bb7733',
  dominoDark: '#885511',
  placement: 'rgba(136,204,255,0.4)',
  branding: '#8888aa',
  brandingBold: '#aaaacc',
} as const;

/** Texture dimensions from BootScene for accurate sizing. */
const BODY_SIZES: Record<string, { w: number; h: number; type: 'circle' | 'rect' }> = {
  ball:   { w: 28, h: 28, type: 'circle' },
  weight: { w: 34, h: 34, type: 'circle' },
  domino: { w: 16, h: 48, type: 'rect' },
  crate:  { w: 40, h: 40, type: 'rect' },
};

interface ExportOptions {
  replayFrames: ReplayFrame[];
  level: Level;
  placement: { type: string; x: number; y: number };
  puzzleNumber: number;
  score: number;
  solved: boolean;
}

/**
 * Exports a replay as an animated GIF.
 * Uses a Web Worker with OffscreenCanvas when available, falls back to synchronous main-thread encoding.
 */
export class ReplayExporter {
  /**
   * Generate an animated GIF blob from replay data.
   * Prefers Web Worker (non-blocking) with sync fallback.
   */
  static async export(options: ExportOptions): Promise<Blob> {
    if (typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined') {
      return this.exportWorker(options);
    }
    return this.exportSync(options);
  }

  /** Non-blocking export via Web Worker + OffscreenCanvas. */
  private static exportWorker(options: ExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL('./ReplayExporter.worker.ts', import.meta.url),
        { type: 'module' },
      );

      worker.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        worker.terminate();
        resolve(new Blob([e.data], { type: 'image/gif' }));
      };

      worker.onerror = (err) => {
        worker.terminate();
        // Fallback to sync on worker failure
        try {
          resolve(this.exportSync(options));
        } catch (syncErr) {
          reject(syncErr);
        }
      };

      const { replayFrames, level, placement, puzzleNumber, score, solved } = options;
      worker.postMessage({
        replayFrames,
        level: {
          staticObjects: level.staticObjects,
          targets: level.targets,
        },
        placement,
        puzzleNumber,
        score,
        solved,
        gameWidth: GAME_WIDTH,
      });
    });
  }

  /** Synchronous fallback — blocks UI for 200-500ms. */
  private static exportSync(options: ExportOptions): Blob {
    const { replayFrames, level, placement, puzzleNumber, score, solved } = options;

    const canvas = document.createElement('canvas');
    canvas.width = GIF_WIDTH;
    canvas.height = GIF_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    const gif = GIFEncoder();

    const playerType = placement.type === 'weight' ? 'weight' : 'ball';

    // Pre-render static background once
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = GIF_WIDTH;
    bgCanvas.height = GIF_HEIGHT;
    const bgCtx = bgCanvas.getContext('2d')!;
    this.drawBackground(bgCtx, level, placement, puzzleNumber);

    // Encode frames
    const totalFrames = replayFrames.length;
    for (let i = 0; i < totalFrames; i += FRAME_SKIP) {
      const frame = replayFrames[i];

      ctx.drawImage(bgCanvas, 0, 0);

      for (let j = 0; j < frame.length; j++) {
        const [x, y, angle] = frame[j];
        const isPlayer = j === frame.length - 1;
        const bodyType = isPlayer ? playerType : 'domino';
        this.drawBody(ctx, x * SCALE, y * SCALE, angle, bodyType, isPlayer);
      }

      this.drawBranding(ctx, puzzleNumber, score, solved);

      const imageData = ctx.getImageData(0, 0, GIF_WIDTH, GIF_HEIGHT);
      const palette = quantize(imageData.data, 128);
      const index = applyPalette(imageData.data, palette);
      gif.writeFrame(index, GIF_WIDTH, GIF_HEIGHT, {
        palette,
        delay: FRAME_DELAY * FRAME_SKIP,
      });
    }

    // Hold last frame longer
    if (totalFrames > 0) {
      const lastFrame = replayFrames[totalFrames - 1];
      ctx.drawImage(bgCanvas, 0, 0);
      for (let j = 0; j < lastFrame.length; j++) {
        const [x, y, angle] = lastFrame[j];
        const isPlayer = j === lastFrame.length - 1;
        const bodyType = isPlayer ? playerType : 'domino';
        this.drawBody(ctx, x * SCALE, y * SCALE, angle, bodyType, isPlayer);
      }
      this.drawBranding(ctx, puzzleNumber, score, solved);

      const imageData = ctx.getImageData(0, 0, GIF_WIDTH, GIF_HEIGHT);
      const palette = quantize(imageData.data, 128);
      const index = applyPalette(imageData.data, palette);
      gif.writeFrame(index, GIF_WIDTH, GIF_HEIGHT, {
        palette,
        delay: 200,
      });
    }

    gif.finish();
    const bytes = gif.bytes();
    return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' });
  }

  /** Draw static level elements (background, platforms, targets, floor). */
  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    level: Level,
    placement: { type: string; x: number; y: number },
    puzzleNumber: number,
  ): void {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GIF_WIDTH, GIF_HEIGHT);

    // Dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let gx = 20; gx < GIF_WIDTH; gx += 20) {
      for (let gy = 20; gy < GIF_HEIGHT; gy += 20) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floor
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, 580 * SCALE, GIF_WIDTH, 20 * SCALE);

    // Static objects
    for (const obj of level.staticObjects) {
      const h = obj.height ?? 20;
      if (obj.type === 'platform') {
        ctx.fillStyle = COLORS.platform;
        ctx.fillRect(obj.x * SCALE, obj.y * SCALE, obj.width * SCALE, h * SCALE);
        ctx.strokeStyle = 'rgba(136,153,170,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obj.x * SCALE, obj.y * SCALE);
        ctx.lineTo((obj.x + obj.width) * SCALE, obj.y * SCALE);
        ctx.stroke();
      } else if (obj.type === 'ramp') {
        ctx.fillStyle = COLORS.ramp;
        const rx = obj.x * SCALE;
        const ry = (obj.y - h / 2) * SCALE;
        ctx.fillRect(rx, ry, obj.width * SCALE, h * SCALE);
      }
    }

    // Targets
    for (const target of level.targets) {
      const tx = target.x * SCALE;
      const ty = target.y * SCALE;
      ctx.fillStyle = COLORS.targetGlow;
      ctx.beginPath();
      ctx.arc(tx, ty, 14 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      this.drawStar(ctx, tx, ty, 12 * SCALE, 5 * SCALE);
    }

    // Placement marker
    ctx.fillStyle = COLORS.placement;
    ctx.beginPath();
    ctx.arc(placement.x * SCALE, placement.y * SCALE, 8 * SCALE, 0, Math.PI * 2);
    ctx.fill();

    // Puzzle header
    ctx.fillStyle = COLORS.brandingBold;
    ctx.font = 'bold 11px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`KETTENREAKTION #${puzzleNumber}`, GIF_WIDTH / 2, 14);
  }

  /** Draw a 5-pointed star. */
  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    outerR: number, innerR: number,
  ): void {
    ctx.fillStyle = COLORS.target;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#bb8800';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** Draw a single physics body at the given position and rotation. */
  private static drawBody(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    angle: number,
    bodyType: string,
    isPlayer: boolean,
  ): void {
    const size = BODY_SIZES[bodyType] ?? BODY_SIZES.domino;
    const w = size.w * SCALE;
    const h = size.h * SCALE;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (size.type === 'circle') {
      const r = w / 2;
      if (bodyType === 'weight') {
        ctx.fillStyle = COLORS.weight;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.weightRing;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(42,53,68,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3 * SCALE, 0);
        ctx.lineTo(3 * SCALE, 0);
        ctx.moveTo(0, -3 * SCALE);
        ctx.lineTo(0, 3 * SCALE);
        ctx.stroke();
      } else {
        ctx.fillStyle = COLORS.ball;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.ballHighlight;
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.25, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isPlayer) {
        ctx.strokeStyle = 'rgba(136,204,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      if (bodyType === 'crate') {
        ctx.fillStyle = '#ccaa55';
      } else {
        ctx.fillStyle = COLORS.domino;
      }
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = COLORS.dominoDark;
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      if (isPlayer) {
        ctx.strokeStyle = 'rgba(136,204,255,0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      }
    }

    ctx.restore();
  }

  /** Draw branding bar at bottom of frame. */
  private static drawBranding(
    ctx: CanvasRenderingContext2D,
    puzzleNumber: number,
    score: number,
    solved: boolean,
  ): void {
    ctx.fillStyle = 'rgba(13,13,26,0.7)';
    ctx.fillRect(0, GIF_HEIGHT - 22, GIF_WIDTH, 22);

    ctx.font = '10px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.branding;
    ctx.fillText(`#${puzzleNumber}`, 6, GIF_HEIGHT - 7);

    ctx.textAlign = 'center';
    ctx.fillStyle = solved ? '#44ee88' : '#ff5544';
    ctx.fillText(
      solved ? `${score.toLocaleString('de-DE')} Punkte` : 'Nicht geschafft',
      GIF_WIDTH / 2,
      GIF_HEIGHT - 7,
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.branding;
    ctx.fillText('kettenreaktion.de', GIF_WIDTH - 6, GIF_HEIGHT - 7);
  }

  /** Trigger a download of the GIF blob. */
  static download(blob: Blob, puzzleNumber: number): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kettenreaktion-${puzzleNumber}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Share the GIF via Web Share API (with file support), or download as fallback. */
  static async share(blob: Blob, puzzleNumber: number): Promise<'shared' | 'downloaded'> {
    const file = new File([blob], `kettenreaktion-${puzzleNumber}.gif`, { type: 'image/gif' });

    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Kettenreaktion #${puzzleNumber}`,
          text: `Meine Kettenreaktion #${puzzleNumber} Loesung!`,
        });
        return 'shared';
      } catch {
        // User cancelled share — fall through to download
      }
    }

    this.download(blob, puzzleNumber);
    return 'downloaded';
  }
}
