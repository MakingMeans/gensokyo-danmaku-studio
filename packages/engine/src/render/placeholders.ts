/**
 * Placeholder drawers used until real community assets are added.
 * Each drawer paints a sprite centred on (0, 0), pointing right (angle 0),
 * so the atlas builder can rotate it as needed.
 */

export type PlaceholderDrawer = (ctx: CanvasRenderingContext2D, color: string) => void;

export function drawBall(radius: number): PlaceholderDrawer {
  return (ctx, color) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  };
}

export function drawRice(radius: number): PlaceholderDrawer {
  return (ctx, color) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 2, radius, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.2, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  };
}

export function drawStar(radius: number): PlaceholderDrawer {
  return (ctx, color) => {
    const outer = radius * 1.6;
    const inner = radius * 0.7;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
}

/** A small shrine maiden silhouette: wide skirt, narrow body, pointing up. */
export const drawPlayer: PlaceholderDrawer = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(7, 4);
  ctx.lineTo(9, 12);
  ctx.lineTo(-9, 12);
  ctx.lineTo(-7, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  ctx.beginPath();
  ctx.arc(0, -6, 4, 0, Math.PI * 2);
  ctx.fill();
};

/** The visible hitbox shown in focus mode: a white core with a red ring. */
export function drawHitbox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2a2a';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}
