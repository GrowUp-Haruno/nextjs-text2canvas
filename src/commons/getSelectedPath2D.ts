import { TextPath } from '../types/TextPath';

export function getSelectedPath2D({ textPath, padding = 4 }: { textPath: TextPath; padding?: number }): Path2D {
  const path = new Path2D();

  const x = textPath.offset.x - padding;
  const y = textPath.endPoint.y - padding;
  const w = textPath.endPoint.x - x + padding;
  const h = textPath.offset.y - y + padding;
  path.rect(x, y, w, h);

  return path;
}