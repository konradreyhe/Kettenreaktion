/** Centralized visual style constants for consistent branding. */

// Typography
export const FONT_TITLE = 'Orbitron, monospace';
export const FONT_UI = 'Orbitron, monospace';

// Brand colors
export const COLOR = {
  // Backgrounds
  bgDark: '#0d0d1a',
  bgPanel: '#1a1a2e',
  bgCard: '#222244',

  // Primary palette
  primary: '#4488ff',
  primaryBright: '#66aaff',
  secondary: '#7744cc',
  accent: '#ffdd44',
  accentDim: '#aa9933',

  // Feedback
  success: '#44ee88',
  fail: '#ff5544',
  warning: '#ffaa44',

  // Text
  textBright: '#ffffff',
  textMuted: '#8888aa',
  textDim: '#555577',
  textSubtle: '#333355',

  // Game elements
  streak: '#ffaa44',
  chain: '#ff8844',
  star: '#ffdd00',
} as const;

// Text shadow config for important text
export const TEXT_SHADOW = {
  offsetX: 2,
  offsetY: 2,
  color: '#000000',
  blur: 4,
  fill: true,
};
