const STAR = '\u2B50';
const FIRE = '\uD83D\uDD25';
const BOOM = '\uD83D\uDCA5';
const CHAIN = '\u26D3';
const GREEN = '\uD83D\uDFE2';
const YELLOW = '\uD83D\uDFE1';
const RED = '\uD83D\uDD34';
const BLACK = '\u2B1B';

import type { ReplayFrame } from '../types/GameState';

export interface ShareParams {
  puzzleNumber: number;
  score: number;
  attempts: number;
  chainLength: number;
  streak: number;
  solved: boolean;
  targetsHit: number;
  totalTargets: number;
  title?: string;
  replay?: ReplayFrame[];
  placement?: { type: string; x: number; y: number };
}

/** Generates share text and handles sharing via Web Share API / Clipboard. */
export class ShareManager {
  /** Generate a Wordle-style visual share card. */
  static generateEmojiResult(params: ShareParams): string {
    const {
      puzzleNumber, score, attempts, chainLength,
      streak, solved, targetsHit, totalTargets,
    } = params;

    // Header
    const status = solved ? STAR : '\u274C';
    const header = `Kettenreaktion #${puzzleNumber} ${status}`;

    // Chain visualization — escalating emojis
    const chainBar = ShareManager.buildChainBar(chainLength);

    // Target hits visualization
    const targetBar = ShareManager.buildTargetBar(targetsHit, totalTargets);

    // Attempt indicator
    const attemptDots = ShareManager.buildAttemptDots(attempts, solved);

    // Chain path arrows from replay data
    const chainPath = ShareManager.buildChainPath(params.replay);

    const lines = [
      header,
      '',
      targetBar,
      chainBar,
      ...(chainPath ? [`\uD83C\uDFAF ${chainPath}`] : []),
      attemptDots,
      '',
      `Score: ${score.toLocaleString('de-DE')}`,
    ];

    if (streak > 1) {
      lines.push(`${FIRE} ${streak} ${streak === 1 ? 'Tag' : 'Tage'} Streak`);
    }

    if (params.title) {
      lines.push(`\u{1F3C6} ${params.title}`);
    }

    // Share URL with optional ghost placement
    const baseUrl = 'kettenreaktion.crelvo.dev';
    if (params.placement) {
      const p = params.placement;
      lines.push('', `${baseUrl}?p=${p.type},${Math.round(p.x)},${Math.round(p.y)}`);
    } else {
      lines.push('', baseUrl);
    }

    return lines.join('\n');
  }

  /** Build chain reaction visualization. */
  private static buildChainBar(chainLength: number): string {
    if (chainLength === 0) return `${CHAIN} -`;

    const capped = Math.min(chainLength, 8);
    const segments: string[] = [];

    for (let i = 0; i < capped; i++) {
      if (i < 3) segments.push(YELLOW);
      else if (i < 6) segments.push(GREEN);
      else segments.push(BOOM);
    }

    return `${CHAIN} ${segments.join('')}${chainLength > 8 ? '+' : ''} x${chainLength}`;
  }

  /** Build target hit visualization. */
  private static buildTargetBar(hit: number, total: number): string {
    const icons: string[] = [];
    for (let i = 0; i < total; i++) {
      icons.push(i < hit ? STAR : BLACK);
    }
    return icons.join('') + ` ${hit}/${total}`;
  }

  /** Build attempt visualization. */
  private static buildAttemptDots(attempts: number, solved: boolean): string {
    const dots: string[] = [];
    for (let i = 1; i <= 3; i++) {
      if (i < attempts) dots.push(RED);
      else if (i === attempts) dots.push(solved ? GREEN : RED);
      else dots.push(BLACK);
    }
    return `Versuche: ${dots.join('')}`;
  }

  /** Build directional arrow path from replay frames showing chain reaction direction. */
  private static buildChainPath(frames?: ReplayFrame[]): string {
    if (!frames || frames.length < 2) return '';

    const arrows: string[] = [];
    const step = Math.max(1, Math.floor(frames.length / 6));

    for (let i = step; i < frames.length && arrows.length < 6; i += step) {
      const prev = frames[i - step][0];
      const curr = frames[i][0];
      if (!prev || !curr) continue;

      const dx = curr[0] - prev[0];
      const dy = curr[1] - prev[1];
      const angle = Math.atan2(dy, dx);

      if (angle > -Math.PI / 4 && angle <= Math.PI / 4) arrows.push('\u27A1\uFE0F');
      else if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) arrows.push('\u2B07\uFE0F');
      else if (angle > -3 * Math.PI / 4 && angle <= -Math.PI / 4) arrows.push('\u2B06\uFE0F');
      else arrows.push('\u2B05\uFE0F');
    }

    return arrows.join('');
  }

  static async share(text: string): Promise<void> {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          text,
          url: 'https://konradreyhe.github.io/Kettenreaktion/',
        });
        return;
      } catch {
        // Share cancelled or failed — fall through to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  /** Share directly via WhatsApp (DACH market primary messenger). */
  static shareWhatsApp(text: string): void {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
}
