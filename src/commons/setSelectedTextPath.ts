import { TextPath } from '../types/TextPath';
import { getSelectedPath2D } from './getSelectedPath2D';
import { initialTextPath } from './initialTextPath';

export function getNewSelectedArea(textPaths: TextPath[]): TextPath {
  let offset = { x: Infinity, y: -Infinity };
  let endPoint = { x: -Infinity, y: Infinity };

  const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
  if (selectedTextPaths.length === 1) return initialTextPath;

  selectedTextPaths.forEach((textPath) => {
    if (textPath.isSelected === false) return;

    if (offset.x > textPath.offset.x) offset.x = textPath.offset.x;
    if (offset.y < textPath.offset.y) offset.y = textPath.offset.y;

    if (endPoint.x < textPath.endPoint.x) endPoint.x = textPath.endPoint.x;
    if (endPoint.y > textPath.endPoint.y) endPoint.y = textPath.endPoint.y;
  });
  const newTextPath = { ...initialTextPath, isSelected: true, offset, endPoint };
  const selectedPath2D = getSelectedPath2D({ textPath: newTextPath });
  return { ...newTextPath, selectedPath2D };
}
