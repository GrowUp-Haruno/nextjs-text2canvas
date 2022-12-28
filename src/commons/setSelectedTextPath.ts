import { TextPath } from '../types/TextPath';
import { initialTextPath } from './initialTextPath';

export function getNewSelectedArea(textPaths: TextPath[]): TextPath {
  let offset = { x: Infinity, y: -Infinity };
  let endPoint = { x: -Infinity, y: Infinity };
  textPaths.forEach((textPath) => {
    if (offset.x > textPath.offset.x) offset.x = textPath.offset.x;
    if (offset.y < textPath.offset.y) offset.y = textPath.offset.y;

    if (endPoint.x < textPath.endPoint.x) endPoint.x = textPath.endPoint.x;
    if (endPoint.y > textPath.endPoint.y) endPoint.y = textPath.endPoint.y;
  });
  return { ...initialTextPath, isSelected: true, offset, endPoint };
}
