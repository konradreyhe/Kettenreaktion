const CHAIN_EMOJI = '\u26D3';
const STAR_EMOJI = '\u2B50';
const FIRE_EMOJI = '\uD83D\uDD25';

interface ShareParams {
  puzzleNumber: number;
  score: number;
  attempts: number;
  chainLength: number;
  streak: number;
  solved: boolean;
}

/** Generates share text and handles sharing via Web Share API / Clipboard. */
export class ShareManager {
  static generateEmojiResult(params: ShareParams): string {
    const { puzzleNumber, score, attempts, chainLength, streak, solved } =
      params;

    const chainIcons = CHAIN_EMOJI.repeat(Math.min(chainLength, 6));
    const status = solved ? STAR_EMOJI : '\u274C';

    const lines = [
      `Kettenreaktion #${puzzleNumber} ${status}`,
      `Kette: ${chainIcons || '-'}`,
      `Score: ${score.toLocaleString('de-DE')} | Versuche: ${attempts}/3`,
    ];

    if (streak > 1) {
      lines.push(`${FIRE_EMOJI} Streak: ${streak} Tage`);
    }

    lines.push('kettenpuzzle.com');

    return lines.join('\n');
  }

  static async share(text: string): Promise<void> {
    if (typeof navigator.share === 'function') {
      await navigator.share({
        text,
        url: 'https://kettenpuzzle.com',
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }
}
