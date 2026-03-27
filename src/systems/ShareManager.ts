const STAR = '\u2B50';
const FIRE = '\uD83D\uDD25';
const BOOM = '\uD83D\uDCA5';
const CHAIN = '\u26D3';
const GREEN = '\uD83D\uDFE2';
const YELLOW = '\uD83D\uDFE1';
const RED = '\uD83D\uDD34';
const BLACK = '\u2B1B';

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

    const lines = [
      header,
      '',
      targetBar,
      chainBar,
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

    lines.push('', 'konradreyhe.github.io/Kettenreaktion');

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
