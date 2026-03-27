const CB_KEY = 'kettenreaktion_colorblind';

/** Manages colorblind mode toggle and reduced motion detection. */
export class AccessibilityManager {
  private static colorblind = false;
  private static reducedMotion = false;

  static init(): void {
    AccessibilityManager.colorblind = localStorage.getItem(CB_KEY) === '1';
    AccessibilityManager.reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }

  static isColorblind(): boolean {
    return AccessibilityManager.colorblind;
  }

  static toggle(): boolean {
    AccessibilityManager.colorblind = !AccessibilityManager.colorblind;
    localStorage.setItem(CB_KEY, AccessibilityManager.colorblind ? '1' : '0');
    return AccessibilityManager.colorblind;
  }

  /** Whether the OS prefers reduced motion */
  static prefersReducedMotion(): boolean {
    return AccessibilityManager.reducedMotion;
  }

  /** Placement zone color — green or blue */
  static get zoneColor(): number {
    return AccessibilityManager.colorblind ? 0x4488ff : 0x44ff44;
  }

  /** Success color — green or blue */
  static get successHex(): string {
    return AccessibilityManager.colorblind ? '#4488ff' : '#44ff44';
  }

  /** Failure color — red or orange */
  static get failHex(): string {
    return AccessibilityManager.colorblind ? '#ffaa44' : '#ff6644';
  }

  /** Near-miss color — red or orange */
  static get nearMissHex(): string {
    return AccessibilityManager.colorblind ? '#ffaa44' : '#ff6644';
  }
}
