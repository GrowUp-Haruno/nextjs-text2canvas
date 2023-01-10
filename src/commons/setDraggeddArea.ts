import { Coordinates, TextPath } from '../types/TextPath';
import { getSelectedPath2D } from './getSelectedPath2D';
import { initialTextPath } from './initialTextPath';

export const getDraggeddArea = ({
  distanceOriginToDrag,
  origin,
  drag,
}: {
  distanceOriginToDrag: Coordinates;
  origin: Coordinates;
  drag: Coordinates;
}): TextPath => {
  let dragPoint = { offset: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } };

  const hasDragged_RightUp = distanceOriginToDrag.x >= 0 && distanceOriginToDrag.y <= 0;
  const hasDragged_RightDown = distanceOriginToDrag.x > 0 && distanceOriginToDrag.y > 0;
  const hasDragged_LeftUp = distanceOriginToDrag.x < 0 && distanceOriginToDrag.y < 0;
  const hasDragged_LeftDown = distanceOriginToDrag.x <= 0 && distanceOriginToDrag.y >= 0;

  // ドラッグの方向
  if (hasDragged_RightUp) dragPoint = { offset: { x: origin.x, y: origin.y }, endPoint: { x: drag.x, y: drag.y } };
  if (hasDragged_RightDown) dragPoint = { offset: { x: origin.x, y: drag.y }, endPoint: { x: drag.x, y: origin.y } };
  if (hasDragged_LeftUp) dragPoint = { offset: { x: drag.x, y: origin.y }, endPoint: { x: origin.x, y: drag.y } };
  if (hasDragged_LeftDown) dragPoint = { offset: { x: drag.x, y: drag.y }, endPoint: { x: origin.x, y: origin.y } };

  const newTextPath = {
    ...initialTextPath,
    isSelected: true,
    offset: { x: dragPoint.offset.x, y: dragPoint.offset.y },
    endPoint: { x: dragPoint.endPoint.x, y: dragPoint.endPoint.y },
  };
  const selectedPath2D = getSelectedPath2D({ textPath: newTextPath, padding: 0 });
  
  return {
    ...newTextPath,
    selectedPath2D,
  };
};
