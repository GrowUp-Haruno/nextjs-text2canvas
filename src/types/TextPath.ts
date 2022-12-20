export type TextPath = Path & {
  offset: Coordinates;
  endPoint: Coordinates;
};

export type Path = {
  commands: opentype.PathCommand[];
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};

export type Coordinates = { x: number; y: number };
