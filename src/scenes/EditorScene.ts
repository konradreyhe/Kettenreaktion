import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, COLOR } from '../constants/Style';
import { AudioManager } from '../systems/AudioManager';
import { SceneTransition } from '../game/SceneTransition';
import type { Level, StaticObject, DynamicObject, Target, ObjectType } from '../types/Level';

type EditorTool = 'platform' | 'ramp' | 'ball' | 'domino' | 'crate' | 'weight' | 'star' | 'zone' | 'select';

interface EditorEntry {
  kind: 'static' | 'dynamic' | 'target' | 'zone';
  gfx: Phaser.GameObjects.GameObject;
  data: StaticObject | DynamicObject | Target | { x: number; y: number; width: number; height: number };
}

const GRID = 20;

const TOOL_COLORS: Record<EditorTool, number> = {
  platform: 0x667788,
  ramp: 0x778899,
  ball: 0x6688cc,
  domino: 0x88aa66,
  crate: 0x998866,
  weight: 0xccaa44,
  star: 0xffdd00,
  zone: 0x44aa66,
  select: 0xffffff,
};

/** Level Editor — visual click-to-place editor behind ?editor=1 feature flag. */
export class EditorScene extends Phaser.Scene {
  private level!: Level;
  private entries: EditorEntry[] = [];
  private selectedTool: EditorTool = 'platform';
  private selectedEntry: EditorEntry | null = null;
  private dynamicCounter = 0;
  private targetCounter = 0;
  private htmlPanel: HTMLDivElement | null = null;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'EditorScene' });
  }

  create(): void {
    this.entries = [];
    this.selectedEntry = null;
    this.dynamicCounter = 0;
    this.targetCounter = 0;

    // Initialize empty level
    this.level = {
      id: `custom_${Date.now()}`,
      name: 'Neues Level',
      difficulty: 1,
      theme: 'wood',
      world: { width: GAME_WIDTH, height: GAME_HEIGHT },
      placementZone: { x: 50, y: 50, width: 150, height: 150, allowedObjects: ['ball'] },
      staticObjects: [
        // Default floor
        { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      ],
      dynamicObjects: [],
      targets: [],
    };

    // Draw grid
    this.gridGfx = this.add.graphics().setDepth(0).setAlpha(0.15);
    this.drawGrid();

    // Zone visual
    this.zoneGfx = this.add.graphics().setDepth(1);
    this.drawZone();

    // Draw the default floor
    this.drawFloor();

    // Title
    this.add.text(GAME_WIDTH / 2, 12, 'LEVEL EDITOR', {
      fontFamily: FONT_TITLE, fontSize: '12px', color: COLOR.textMuted,
    }).setOrigin(0.5).setDepth(50);

    // Create HTML panel
    this.createHTMLPanel();

    // Input handling
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      // Ignore if click is in the HTML panel area (right 260px)
      if (ptr.x > GAME_WIDTH - 10) return;
      this.handleCanvasClick(ptr.x, ptr.y);
    });

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-DELETE', () => this.deleteSelected());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.deleteSelected());
    this.input.keyboard?.on('keydown-ESC', () => {
      this.selectedEntry = null;
      this.updatePropertiesPanel();
    });

    SceneTransition.wipeIn(this);
  }

  private drawGrid(): void {
    this.gridGfx.clear();
    this.gridGfx.lineStyle(1, 0x4466aa, 0.3);
    for (let x = 0; x <= GAME_WIDTH; x += GRID) {
      this.gridGfx.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += GRID) {
      this.gridGfx.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  private drawZone(): void {
    this.zoneGfx.clear();
    const pz = this.level.placementZone;
    this.zoneGfx.lineStyle(2, 0x44aa66, 0.6);
    this.zoneGfx.strokeRect(pz.x, pz.y, pz.width, pz.height);
    this.zoneGfx.fillStyle(0x44aa66, 0.1);
    this.zoneGfx.fillRect(pz.x, pz.y, pz.width, pz.height);
  }

  private drawFloor(): void {
    const floor = this.level.staticObjects[0];
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(0x667788, 0.8);
    gfx.fillRect(floor.x, floor.y, floor.width, floor.height ?? 20);
    gfx.lineStyle(1, 0x8899aa, 0.5);
    gfx.strokeRect(floor.x, floor.y, floor.width, floor.height ?? 20);
  }

  private snap(v: number): number {
    return Math.round(v / GRID) * GRID;
  }

  private handleCanvasClick(x: number, y: number): void {
    const sx = this.snap(x);
    const sy = this.snap(y);

    if (this.selectedTool === 'select') {
      this.selectAt(x, y);
      return;
    }

    AudioManager.playPlace();

    switch (this.selectedTool) {
      case 'platform':
        this.addPlatform(sx, sy);
        break;
      case 'ramp':
        this.addRamp(sx, sy);
        break;
      case 'ball':
      case 'domino':
      case 'crate':
      case 'weight':
        this.addDynamic(this.selectedTool, sx, sy);
        break;
      case 'star':
        this.addTarget(sx, sy);
        break;
      case 'zone':
        this.moveZone(sx, sy);
        break;
    }

    this.rebuildLevel();
    this.updatePropertiesPanel();
  }

  private addPlatform(x: number, y: number): void {
    const obj: StaticObject = { type: 'platform', x: x - 100, y, width: 200, height: 12 };
    this.level.staticObjects.push(obj);

    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(TOOL_COLORS.platform, 0.8);
    gfx.fillRect(obj.x, obj.y, obj.width, obj.height ?? 12);
    gfx.lineStyle(1, 0x8899aa, 0.5);
    gfx.strokeRect(obj.x, obj.y, obj.width, obj.height ?? 12);

    this.entries.push({ kind: 'static', gfx, data: obj });
  }

  private addRamp(x: number, y: number): void {
    const obj: StaticObject = { type: 'ramp', x: x - 75, y, width: 150, angle: -15 };
    this.level.staticObjects.push(obj);

    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(TOOL_COLORS.ramp, 0.6);
    // Draw angled rectangle
    const hw = 75;
    const rad = (-15 * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const cx = x;
    const cy = y;
    gfx.fillTriangle(
      cx - hw * cos, cy - hw * sin,
      cx + hw * cos, cy + hw * sin,
      cx + hw * cos - 6 * sin, cy + hw * sin + 6 * cos,
    );
    gfx.fillTriangle(
      cx - hw * cos, cy - hw * sin,
      cx + hw * cos - 6 * sin, cy + hw * sin + 6 * cos,
      cx - hw * cos - 6 * sin, cy - hw * sin + 6 * cos,
    );

    this.entries.push({ kind: 'static', gfx, data: obj });
  }

  private addDynamic(type: ObjectType, x: number, y: number): void {
    this.dynamicCounter++;
    const obj: DynamicObject = { id: `d${this.dynamicCounter}`, type, x, y };
    this.level.dynamicObjects.push(obj);

    const sizes: Record<string, { w: number; h: number }> = {
      ball: { w: 28, h: 28 }, domino: { w: 16, h: 48 },
      crate: { w: 40, h: 40 }, weight: { w: 34, h: 34 },
    };
    const size = sizes[type] ?? { w: 30, h: 30 };
    const color = TOOL_COLORS[type as EditorTool] ?? 0x888888;

    const gfx = this.add.graphics().setDepth(10);
    if (type === 'ball' || type === 'weight') {
      gfx.fillStyle(color, 0.8);
      gfx.fillCircle(x, y, size.w / 2);
      gfx.lineStyle(1, 0xffffff, 0.3);
      gfx.strokeCircle(x, y, size.w / 2);
    } else {
      gfx.fillStyle(color, 0.8);
      gfx.fillRect(x - size.w / 2, y - size.h / 2, size.w, size.h);
      gfx.lineStyle(1, 0xffffff, 0.3);
      gfx.strokeRect(x - size.w / 2, y - size.h / 2, size.w, size.h);
    }

    // Label
    this.add.text(x, y - size.h / 2 - 8, obj.id, {
      fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0.5).setDepth(11);

    this.entries.push({ kind: 'dynamic', gfx, data: obj });
  }

  private addTarget(x: number, y: number): void {
    this.targetCounter++;
    const obj: Target = { id: `t${this.targetCounter}`, type: 'star', x, y, points: 100 };
    this.level.targets.push(obj);

    const gfx = this.add.graphics().setDepth(10);
    gfx.fillStyle(TOOL_COLORS.star, 0.9);
    gfx.fillCircle(x, y, 12);
    gfx.lineStyle(2, 0xffaa00, 0.8);
    gfx.strokeCircle(x, y, 12);

    this.add.text(x, y, '\u2605', {
      fontSize: '16px', color: '#000',
    }).setOrigin(0.5).setDepth(11);

    this.entries.push({ kind: 'target', gfx, data: obj });
  }

  private moveZone(x: number, y: number): void {
    const pz = this.level.placementZone;
    pz.x = x;
    pz.y = y;
    this.drawZone();
  }

  private selectAt(x: number, y: number): void {
    // Find nearest entry within 30px
    let best: EditorEntry | null = null;
    let bestDist = 30;

    for (const entry of this.entries) {
      const d = entry.data as { x: number; y: number };
      const dx = d.x - x;
      const dy = d.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = entry;
      }
    }

    this.selectedEntry = best;
    this.updatePropertiesPanel();
  }

  private deleteSelected(): void {
    if (!this.selectedEntry) return;

    const entry = this.selectedEntry;
    const idx = this.entries.indexOf(entry);
    if (idx >= 0) this.entries.splice(idx, 1);

    // Remove from level data
    if (entry.kind === 'static') {
      const si = this.level.staticObjects.indexOf(entry.data as StaticObject);
      if (si >= 0) this.level.staticObjects.splice(si, 1);
    } else if (entry.kind === 'dynamic') {
      const di = this.level.dynamicObjects.indexOf(entry.data as DynamicObject);
      if (di >= 0) this.level.dynamicObjects.splice(di, 1);
    } else if (entry.kind === 'target') {
      const ti = this.level.targets.indexOf(entry.data as Target);
      if (ti >= 0) this.level.targets.splice(ti, 1);
    }

    // Remove visual
    if (entry.gfx && 'destroy' in entry.gfx) {
      (entry.gfx as Phaser.GameObjects.Graphics).destroy();
    }

    this.selectedEntry = null;
    this.rebuildLevel();
    this.updatePropertiesPanel();
  }

  private rebuildLevel(): void {
    // Level data is already updated in-place via references
  }

  // ---- HTML Panel ----

  private createHTMLPanel(): void {
    this.htmlPanel = document.createElement('div');
    this.htmlPanel.id = 'editor-panel';
    this.htmlPanel.style.cssText = `
      position: fixed; top: 0; right: 0;
      width: 250px; height: 100vh;
      background: #12122aee; color: #aaaacc;
      font-family: 'Orbitron', monospace; font-size: 11px;
      padding: 12px; overflow-y: auto; z-index: 1000;
      border-left: 1px solid #333366;
      box-sizing: border-box;
    `;

    this.htmlPanel.innerHTML = this.buildPanelHTML();
    document.body.appendChild(this.htmlPanel);

    this.bindPanelEvents();
  }

  private buildPanelHTML(): string {
    const tools: { key: EditorTool; label: string; icon: string }[] = [
      { key: 'select', label: 'Auswahl', icon: '\u25B6' },
      { key: 'platform', label: 'Plattform', icon: '\u25AC' },
      { key: 'ramp', label: 'Rampe', icon: '\u2571' },
      { key: 'ball', label: 'Kugel', icon: '\u25CF' },
      { key: 'domino', label: 'Domino', icon: '\u25AE' },
      { key: 'crate', label: 'Kiste', icon: '\u25A0' },
      { key: 'weight', label: 'Gewicht', icon: '\u25C9' },
      { key: 'star', label: 'Stern', icon: '\u2605' },
      { key: 'zone', label: 'Zone', icon: '\u25A1' },
    ];

    const toolButtons = tools.map((t) => {
      const active = t.key === this.selectedTool;
      return `<button class="ed-tool" data-tool="${t.key}" style="
        background: ${active ? '#335577' : '#222244'};
        color: ${active ? '#88ccff' : '#667788'};
        border: 1px solid ${active ? '#66aadd' : '#333355'};
        padding: 4px 6px; margin: 2px; cursor: pointer;
        font-family: inherit; font-size: 10px; border-radius: 3px;
      ">${t.icon} ${t.label}</button>`;
    }).join('');

    return `
      <div style="margin-bottom:12px;color:#667788;font-size:9px">Werkzeuge</div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:16px">${toolButtons}</div>

      <div style="margin-bottom:8px;color:#667788;font-size:9px">Level</div>
      <label style="display:block;margin:4px 0">Name:
        <input id="ed-name" value="${this.level.name}" style="width:100%;background:#1a1a2e;color:#ccc;border:1px solid #444;padding:3px;font-size:10px;box-sizing:border-box">
      </label>
      <label style="display:block;margin:4px 0">Schwierigkeit:
        <select id="ed-diff" style="background:#1a1a2e;color:#ccc;border:1px solid #444;padding:2px;font-size:10px">
          ${[1, 2, 3, 4, 5].map((d) => `<option value="${d}" ${d === this.level.difficulty ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </label>
      <label style="display:block;margin:4px 0">Thema:
        <select id="ed-theme" style="background:#1a1a2e;color:#ccc;border:1px solid #444;padding:2px;font-size:10px">
          ${(['wood', 'stone', 'metal'] as const).map((t) => `<option value="${t}" ${t === this.level.theme ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>

      <div id="ed-props" style="margin-top:16px;padding-top:8px;border-top:1px solid #333"></div>

      <div style="margin-top:16px;border-top:1px solid #333;padding-top:8px">
        <div style="color:#667788;font-size:9px;margin-bottom:6px">
          Objekte: ${this.level.staticObjects.length - 1} Plattformen, ${this.level.dynamicObjects.length} Dynamisch, ${this.level.targets.length} Sterne
        </div>
      </div>

      <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
        <button id="ed-test" style="background:#335577;color:#88ccff;border:1px solid #66aadd;padding:8px;cursor:pointer;font-family:inherit;font-size:11px;border-radius:3px">
          \u25B6 Level testen
        </button>
        <button id="ed-export" style="background:#222244;color:#aaaacc;border:1px solid #444466;padding:6px;cursor:pointer;font-family:inherit;font-size:10px;border-radius:3px">
          JSON kopieren
        </button>
        <button id="ed-clear" style="background:#332222;color:#cc8888;border:1px solid #664444;padding:6px;cursor:pointer;font-family:inherit;font-size:10px;border-radius:3px">
          Alles loeschen
        </button>
        <button id="ed-back" style="background:#222244;color:#888899;border:1px solid #444466;padding:6px;cursor:pointer;font-family:inherit;font-size:10px;border-radius:3px">
          Zurueck
        </button>
      </div>
    `;
  }

  private bindPanelEvents(): void {
    if (!this.htmlPanel) return;

    // Tool buttons
    this.htmlPanel.querySelectorAll('.ed-tool').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tool = (e.currentTarget as HTMLElement).dataset.tool as EditorTool;
        this.selectedTool = tool;
        this.refreshPanel();
      });
    });

    // Level properties
    this.htmlPanel.querySelector('#ed-name')?.addEventListener('input', (e) => {
      this.level.name = (e.target as HTMLInputElement).value;
    });
    this.htmlPanel.querySelector('#ed-diff')?.addEventListener('change', (e) => {
      this.level.difficulty = parseInt((e.target as HTMLSelectElement).value, 10);
    });
    this.htmlPanel.querySelector('#ed-theme')?.addEventListener('change', (e) => {
      this.level.theme = (e.target as HTMLSelectElement).value as 'wood' | 'stone' | 'metal';
    });

    // Action buttons
    this.htmlPanel.querySelector('#ed-test')?.addEventListener('click', () => this.testLevel());
    this.htmlPanel.querySelector('#ed-export')?.addEventListener('click', () => this.exportJSON());
    this.htmlPanel.querySelector('#ed-clear')?.addEventListener('click', () => this.clearAll());
    this.htmlPanel.querySelector('#ed-back')?.addEventListener('click', () => this.goBack());
  }

  private refreshPanel(): void {
    if (!this.htmlPanel) return;
    this.htmlPanel.innerHTML = this.buildPanelHTML();
    this.bindPanelEvents();
  }

  private updatePropertiesPanel(): void {
    const propsDiv = this.htmlPanel?.querySelector('#ed-props');
    if (!propsDiv) return;

    if (!this.selectedEntry) {
      propsDiv.innerHTML = '<div style="color:#555;font-size:9px">Klicke auf ein Objekt zum Bearbeiten</div>';
      return;
    }

    const d = this.selectedEntry.data;
    propsDiv.innerHTML = `
      <div style="color:#88ccff;font-size:9px;margin-bottom:4px">Ausgewaehlt: ${this.selectedEntry.kind}</div>
      <div style="color:#aaa;font-size:9px">x: ${(d as { x: number }).x}, y: ${(d as { y: number }).y}</div>
      <button id="ed-delete" style="margin-top:6px;background:#442222;color:#ff8888;border:1px solid #664444;padding:4px 8px;cursor:pointer;font-size:9px;border-radius:2px">
        Loeschen (Entf)
      </button>
    `;

    propsDiv.querySelector('#ed-delete')?.addEventListener('click', () => this.deleteSelected());
  }

  private testLevel(): void {
    if (this.level.targets.length === 0) {
      this.showToast('Mindestens einen Stern platzieren!');
      return;
    }

    // Store level and start game with it
    sessionStorage.setItem('editor_level', JSON.stringify(this.level));
    this.removePanel();
    this.scene.start('GameScene', { editorLevel: this.level });
  }

  private exportJSON(): void {
    const json = JSON.stringify(this.level, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.showToast('JSON kopiert!');
    }).catch(() => {
      // Fallback: log to console
      console.log(json);
      this.showToast('JSON in Konsole ausgegeben');
    });
  }

  private clearAll(): void {
    // Destroy all entry graphics
    for (const entry of this.entries) {
      if (entry.gfx && 'destroy' in entry.gfx) {
        (entry.gfx as Phaser.GameObjects.Graphics).destroy();
      }
    }
    this.entries = [];
    this.selectedEntry = null;
    this.dynamicCounter = 0;
    this.targetCounter = 0;

    // Reset level to defaults
    this.level.staticObjects = [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
    ];
    this.level.dynamicObjects = [];
    this.level.targets = [];
    this.level.placementZone = { x: 50, y: 50, width: 150, height: 150, allowedObjects: ['ball'] };

    this.drawZone();
    this.refreshPanel();
  }

  private goBack(): void {
    this.removePanel();
    SceneTransition.wipeOut(this, 'MenuScene');
  }

  private removePanel(): void {
    this.htmlPanel?.remove();
    this.htmlPanel = null;
  }

  private showToast(msg: string): void {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '14px', color: '#88ccff', backgroundColor: '#222244',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: toast, alpha: 0, y: GAME_HEIGHT / 2 - 30,
      duration: 1500, ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  shutdown(): void {
    this.removePanel();
  }
}
