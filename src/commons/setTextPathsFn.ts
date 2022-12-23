import { TextPath } from '../types/TextPath';

export const isSelectedReset = (textPaths: TextPath[]) => {
  const newArray = textPaths.map((textPath) => ({ ...textPath, isSelected: false }));
  return [...newArray];
};

export const isSelectedDelete = (textPaths: TextPath[]) => {
  const newArray = textPaths.filter((textPath) => textPath.isSelected === false);
  return [...newArray];
};
