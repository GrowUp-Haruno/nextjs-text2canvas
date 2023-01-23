import { TextPath } from '../types/TextPath';

export function getSelectedPath2D({ textPath, padding = 4 }: { textPath: TextPath; padding?: number }): Path2D {
  const path = new Path2D();
  const { x, y, w, h } = textPath.selectedArea;

  path.rect(x, y, w, h);

  return path;
}
