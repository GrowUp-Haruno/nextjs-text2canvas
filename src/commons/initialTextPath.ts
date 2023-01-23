import { TextPath } from '../types/TextPath';

export const initialTextPath: TextPath = {
  commands: [],
  fill: null,
  stroke: null,
  text: '',
  strokeWidth: 0,
  isSelected: false,
  offset: { x: Infinity, y: -Infinity },
  selectedArea: { x: 0, y: 0, w: 0, h: 0, centerX: 0, centerY: 0, halfW: 0, halfH: 0 },
  path2D: undefined,
  selectedPath2D: undefined,
};
