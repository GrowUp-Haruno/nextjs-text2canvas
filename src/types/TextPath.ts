export type TextPath = Path & {
  offset: Coordinates;
  endPoint: Coordinates;
  text: string;
  isSelected: boolean;
  path2D: Path2D;
  selectedPath2D: Path2D;
};

export type Path = {
  commands: opentype.PathCommand[];
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};

export type Coordinates = { x: number; y: number };
