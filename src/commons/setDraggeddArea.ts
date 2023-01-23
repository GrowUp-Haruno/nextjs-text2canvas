import { Coordinates, SelectedArea, TextPath } from '../types/TextPath';
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
  let x = 0;
  let y = 0;
  const w = Math.abs(drag.x - origin.x);
  const h = Math.abs(drag.y - origin.y);
  const halfW = w / 2;
  const halfH = h / 2;

  const hasDragged_RightUp = distanceOriginToDrag.x >= 0 && distanceOriginToDrag.y <= 0;
  const hasDragged_RightDown = distanceOriginToDrag.x > 0 && distanceOriginToDrag.y > 0;
  const hasDragged_LeftUp = distanceOriginToDrag.x < 0 && distanceOriginToDrag.y < 0;
  const hasDragged_LeftDown = distanceOriginToDrag.x <= 0 && distanceOriginToDrag.y >= 0;

  // ドラッグの方向
  if (hasDragged_RightUp) {
    x = origin.x;
    y = drag.y;
  }
  if (hasDragged_RightDown) {
    x = origin.x;
    y = origin.y;
  }
  if (hasDragged_LeftUp) {
    x = drag.x;
    y = drag.y;
  }
  if (hasDragged_LeftDown) {
    x = drag.x;
    y = origin.y;
  }

  const centerX = x + halfW;
  const centerY = y + halfH;

  const selectedArea: SelectedArea = { x, y, w, h, centerX, centerY, halfW, halfH };
  const newTextPath: TextPath = {
    ...initialTextPath,
    isSelected: true,
    selectedArea,
  };
  const selectedPath2D = getSelectedPath2D({ textPath: newTextPath, padding: 0 });

  return {
    ...newTextPath,
    selectedPath2D,
  };
};
