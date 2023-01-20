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
  let selectedArea: SelectedArea = { x: 0, y: 0, w: 0, h: 0 };

  const hasDragged_RightUp = distanceOriginToDrag.x >= 0 && distanceOriginToDrag.y <= 0;
  const hasDragged_RightDown = distanceOriginToDrag.x > 0 && distanceOriginToDrag.y > 0;
  const hasDragged_LeftUp = distanceOriginToDrag.x < 0 && distanceOriginToDrag.y < 0;
  const hasDragged_LeftDown = distanceOriginToDrag.x <= 0 && distanceOriginToDrag.y >= 0;

  // ドラッグの方向
  if (hasDragged_RightUp) selectedArea = { x: origin.x, y: drag.y, w: drag.x - origin.x, h: origin.y - drag.y };
  if (hasDragged_RightDown) selectedArea = { x: origin.x, y: origin.y, w: drag.x - origin.x, h: drag.y - origin.y };
  if (hasDragged_LeftUp) selectedArea = { x: drag.x, y: drag.y, w: origin.x - drag.x, h: origin.y - drag.y };
  if (hasDragged_LeftDown) selectedArea = { x: drag.x, y: origin.y, w: origin.x - drag.x, h: drag.y - origin.y };

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
