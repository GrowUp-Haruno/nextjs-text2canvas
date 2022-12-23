import { TextPath } from '../types/TextPath';

export const isSelectedReset = (textPaths: TextPath[]) => {
  const newArray = textPaths.map((textPath) => ({ ...textPath, isSelected: false }));
  return [...newArray];
};
