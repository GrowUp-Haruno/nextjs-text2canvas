import { TextPath } from '../types/TextPath';

export const isSelectedReset = (textPaths: TextPath[]) => {
  const newArray = textPaths.map((textPath) => ({ ...textPath, isSelected: false }));
  return [...newArray];
};

export const isSelectedDelete = (textPaths: TextPath[]) => {
  const newArray = textPaths.filter((textPath) => textPath.isSelected === false);
  return [...newArray];
};

export const getNewTextPaths = ({ textPaths, draggedArea }: { textPaths: TextPath[]; draggedArea: TextPath }) => {
  const newTextPath = textPaths.map((textPath) => {
    const distanceCenterX = Math.abs(draggedArea.selectedArea.centerX - textPath.selectedArea.centerX);
    const distanceCenterY = Math.abs(draggedArea.selectedArea.centerY - textPath.selectedArea.centerY);
    const sumHalfW = draggedArea.selectedArea.halfW + textPath.selectedArea.halfW;
    const sumHalfH = draggedArea.selectedArea.halfH + textPath.selectedArea.halfH;
    const isWithinRangeX = distanceCenterX < sumHalfW;
    const isWithinRangeY = distanceCenterY < sumHalfH;
    textPath.isSelected = isWithinRangeX && isWithinRangeY;
    return textPath;
  });

  return newTextPath;
};
