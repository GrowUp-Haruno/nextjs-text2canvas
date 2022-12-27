import { TextPath } from '../types/TextPath';

export const initialTextPath: TextPath = {
  commands: [],
  fill: null,
  stroke: null,
  text: '',
  strokeWidth: 0,
  isSelected: false,
  offset: { x: Infinity, y: -Infinity },
  endPoint: { x: -Infinity, y: Infinity },
};
