import { TextPath } from '../types/TextPath';

export function getNewPosition({ prev, textPath }: { prev: TextPath; textPath: TextPath }) {
  let offset = prev.offset;
  if (offset.x > textPath.offset.x) offset.x = textPath.offset.x;
  if (offset.y < textPath.offset.y) offset.y = textPath.offset.y;

  let endPoint = prev.endPoint;
  if (endPoint.x < textPath.endPoint.x) endPoint.x = textPath.endPoint.x;
  if (endPoint.y > textPath.endPoint.y) endPoint.y = textPath.endPoint.y;
  return { offset, endPoint };
}
