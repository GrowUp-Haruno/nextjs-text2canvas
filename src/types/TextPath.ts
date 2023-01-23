export type TextPath = Path & {
  offset: Coordinates;
  selectedArea: SelectedArea;
  text: string;
  isSelected: boolean;
  path2D: Path2D | undefined;
  selectedPath2D: Path2D | undefined;
};

export type Path = {
  commands: opentype.PathCommand[];
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};

export type Coordinates = { x: number; y: number };
export type SelectedArea = {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  hw: number;
  hh: number;
};
