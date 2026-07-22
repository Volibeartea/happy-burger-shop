import * as THREE from 'three';

export interface TextSpriteOptions {
  fontSize?: number;
  padding?: number;
  bg?: string;
  color?: string;
  /** World-space height of the sprite. */
  worldHeight?: number;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Builds a camera-facing text label as a Three.js Sprite from a 2D canvas.
 * Used for station name plates and storage bin labels (placeholder art).
 */
export function createTextSprite(text: string, options: TextSpriteOptions = {}): THREE.Sprite {
  const fontSize = options.fontSize ?? 46;
  const padding = options.padding ?? 22;
  const font = `bold ${fontSize}px "Segoe UI", system-ui, sans-serif`;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('2D canvas context unavailable');
  measureCtx.font = font;
  const textWidth = Math.ceil(measureCtx.measureText(text).width);

  const canvas = document.createElement('canvas');
  const scale = 2; // extra resolution for crisp text
  canvas.width = (textWidth + padding * 2) * scale;
  canvas.height = (fontSize + padding * 2) * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.scale(scale, scale);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const w = canvas.width / scale;
  const h = canvas.height / scale;

  ctx.fillStyle = options.bg ?? 'rgba(24, 28, 38, 0.86)';
  roundRect(ctx, 0, 0, w, h, 18);
  ctx.fill();

  ctx.fillStyle = options.color ?? '#ffffff';
  ctx.fillText(text, w / 2, h / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  const worldHeight = options.worldHeight ?? 0.55;
  const aspect = w / h;
  sprite.scale.set(worldHeight * aspect, worldHeight, 1);
  sprite.renderOrder = 999;
  // Decorative labels must not intercept pointer raycasts.
  sprite.raycast = () => {};
  return sprite;
}
