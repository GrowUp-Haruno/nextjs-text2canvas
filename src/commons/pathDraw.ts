import { TPath } from '../app/TextToCanvas';

export function pathDraw({
  ctx,
  path,
  offsetX,
  offsetY,
}: {
  ctx: CanvasRenderingContext2D;
  path: TPath;
  offsetX: number;
  offsetY: number;
}) {
  ctx.beginPath();
  for (let i = 0; i < path.commands.length; i += 1) {
    const cmd = path.commands[i];
    if (cmd.type === 'M') {
      ctx.moveTo(cmd.x + offsetX, cmd.y + offsetY);
    } else if (cmd.type === 'L') {
      ctx.lineTo(cmd.x + offsetX, cmd.y + offsetY);
    } else if (cmd.type === 'C') {
      ctx.bezierCurveTo(
        cmd.x1 + offsetX,
        cmd.y1 + offsetY,
        cmd.x2 + offsetX,
        cmd.y2 + offsetY,
        cmd.x + offsetX,
        cmd.y + offsetY
      );
    } else if (cmd.type === 'Q') {
      ctx.quadraticCurveTo(cmd.x1 + offsetX, cmd.y1 + offsetY, cmd.x + offsetX, cmd.y + offsetY);
    } else if (cmd.type === 'Z') {
      ctx.closePath();
    }
  }

  if (path.fill) {
    ctx.fillStyle = path.fill;
    ctx.fill();
  }

  if (path.stroke) {
    ctx.strokeStyle = path.stroke;
    ctx.lineWidth = path.strokeWidth;
    ctx.stroke();
  }
}
