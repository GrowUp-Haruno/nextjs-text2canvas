import { TextPath } from '../types/TextPath';

export function getSelectedPath2D({ textPath, padding = 4 }: { textPath: TextPath; padding?: number }): Path2D {
  const path = new Path2D();

  const x = textPath.selectedArea.x; //- padding;
  const y = textPath.selectedArea.y; //- padding;
  const w = textPath.selectedArea.w; //+ padding * 2;
  const h = textPath.selectedArea.h; //+ padding * 2;
  path.rect(x, y, w, h);

  return path;
}
