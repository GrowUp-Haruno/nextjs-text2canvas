import { TextPath } from '../types/TextPath';

export function pathDraw({
  ctx,
  textPath,
  offsetX,
  offsetY,
}: {
  ctx: CanvasRenderingContext2D;
  textPath: TextPath;
  offsetX: number;
  offsetY: number;
}) {
  ctx.save();
  ctx.beginPath();

  for (let i = 0; i < textPath.commands.length; i += 1) {
    const cmd = textPath.commands[i];
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

  if (textPath.fill) {
    ctx.fillStyle = textPath.fill;
    ctx.fill();
  }

  if (textPath.stroke) {
    ctx.strokeStyle = textPath.stroke;
    ctx.lineWidth = textPath.strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}
