import { TextPath } from '../types/TextPath';

export function getPath2D(textPath: TextPath): Path2D {
  const path = new Path2D();

  textPath.commands.forEach((cmd) => {
    if (cmd.type === 'M') {
      path.moveTo(cmd.x + textPath.offset.x, cmd.y + textPath.offset.y);
    } else if (cmd.type === 'L') {
      path.lineTo(cmd.x + textPath.offset.x, cmd.y + textPath.offset.y);
    } else if (cmd.type === 'C') {
      path.bezierCurveTo(
        cmd.x1 + textPath.offset.x,
        cmd.y1 + textPath.offset.y,
        cmd.x2 + textPath.offset.x,
        cmd.y2 + textPath.offset.y,
        cmd.x + textPath.offset.x,
        cmd.y + textPath.offset.y
      );
    } else if (cmd.type === 'Q') {
      path.quadraticCurveTo(
        cmd.x1 + textPath.offset.x,
        cmd.y1 + textPath.offset.y,
        cmd.x + textPath.offset.x,
        cmd.y + textPath.offset.y
      );
    } else if (cmd.type === 'Z') {
      path.closePath();
    }
  });

  return path;
}
