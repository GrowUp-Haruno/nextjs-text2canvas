import { TextPath } from '../types/TextPath';

export function pathDraw({
  ctx,
  textPath,
  padding = 4,
}: {
  ctx: CanvasRenderingContext2D;
  textPath: TextPath;
  padding?: number;
}) {
  ctx.save();
  ctx.beginPath();

  for (let i = 0; i < textPath.commands.length; i += 1) {
    const cmd = textPath.commands[i];
    if (cmd.type === 'M') {
      ctx.moveTo(cmd.x + textPath.offset.x, cmd.y + textPath.offset.y);
    } else if (cmd.type === 'L') {
      ctx.lineTo(cmd.x + textPath.offset.x, cmd.y + textPath.offset.y);
    } else if (cmd.type === 'C') {
      ctx.bezierCurveTo(
        cmd.x1 + textPath.offset.x,
        cmd.y1 + textPath.offset.y,
        cmd.x2 + textPath.offset.x,
        cmd.y2 + textPath.offset.y,
        cmd.x + textPath.offset.x,
        cmd.y + textPath.offset.y
      );
    } else if (cmd.type === 'Q') {
      ctx.quadraticCurveTo(
        cmd.x1 + textPath.offset.x,
        cmd.y1 + textPath.offset.y,
        cmd.x + textPath.offset.x,
        cmd.y + textPath.offset.y
      );
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

  if (textPath.isSelected) {
    ctx.beginPath();
    const x = textPath.offset.x - padding;
    const y = textPath.endPoint.y - padding;
    const w = textPath.endPoint.x - x + padding;
    const h = textPath.offset.y - y + padding;
    ctx.fillStyle = 'rgba(30, 144, 255, 0.2)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'dodgerblue';
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
}
