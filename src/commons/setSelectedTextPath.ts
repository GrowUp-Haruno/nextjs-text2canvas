import { SelectedArea, TextPath } from '../types/TextPath';
import { getSelectedPath2D } from './getSelectedPath2D';
import { initialTextPath } from './initialTextPath';

export function getNewSelectedArea(textPaths: TextPath[]): TextPath {
  let startPoint = { x: Infinity, y: Infinity };
  let endPoint = { x: -Infinity, y: -Infinity };

  const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
  // if (selectedTextPaths.length === 1) return initialTextPath;

  selectedTextPaths.forEach((textPath) => {
    if (textPath.isSelected === false) return;

    if (startPoint.x > textPath.selectedArea.x) startPoint.x = textPath.selectedArea.x;
    if (startPoint.y > textPath.selectedArea.y) startPoint.y = textPath.selectedArea.y;

    const endX = textPath.selectedArea.x + textPath.selectedArea.w;
    const endY = textPath.selectedArea.y + textPath.selectedArea.h;
    if (endPoint.x < endX) endPoint.x = endX;
    if (endPoint.y < endY) endPoint.y = endY;
  });

  const x = startPoint.x;
  const y = startPoint.y;
  const w = endPoint.x - startPoint.x;
  const h = endPoint.y - startPoint.y;
  const hw = w / 2;
  const hh = h / 2;
  const cx = x + hw;
  const cy = y + hh;

  const selectedArea: SelectedArea = { x, y, w, h, cx, cy, hw, hh };
  const isSelected = selectedTextPaths.length === 1 ? false : true;
  const newTextPath: TextPath = { ...Object.create(initialTextPath), isSelected, selectedArea };
  const selectedPath2D = getSelectedPath2D({ textPath: newTextPath });

  return { ...newTextPath, selectedPath2D };
}
