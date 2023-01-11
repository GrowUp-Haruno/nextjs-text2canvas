import { TextPath } from '../types/TextPath';

export function pathDraw({
  ctx,
  textPath,
}: {
  ctx: CanvasRenderingContext2D;
  textPath: TextPath;
}) {
  ctx.save();

  if (textPath.fill) {
    ctx.fillStyle = textPath.fill;
    ctx.fill(textPath.path2D!);
  }

  if (textPath.stroke) {
    ctx.strokeStyle = textPath.stroke;
    ctx.lineWidth = textPath.strokeWidth;
    ctx.stroke(textPath.path2D!);
  }

  if (textPath.isSelected) {
    ctx.fillStyle = 'rgba(30, 144, 255, 0.2)';
    ctx.strokeStyle = 'dodgerblue';
    
    ctx.fill(textPath.selectedPath2D!);
    ctx.stroke(textPath.selectedPath2D!);
  }

  ctx.restore();
}
