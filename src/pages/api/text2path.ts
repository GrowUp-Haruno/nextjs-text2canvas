import type { NextApiRequest, NextApiResponse } from 'next';
import opentype from 'opentype.js';
import * as fp from 'path';
import { Coordinates, SelectedArea, TextPath } from '../../types/TextPath';

type Data = {
  textPath: TextPath;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.log(req.method);
  console.log(req.body);

  if (req.method !== 'POST') return res.status(500);

  const MAX_TEXT_LENGTH = 20;
  const FONT_SIZE = 76;
  const POSITION_X = 0;
  const POSITION_Y = 0;
  const FILL = 'red';
  const STORKE = 'black';

  const { text }: { text: string } = req.body;
  const regex = /[&'`"<>]/g;
  if (regex.test(text)) return res.status(500);
  if (!(text.length <= MAX_TEXT_LENGTH)) return res.status(500);

  const filePath = fp.join(process.cwd(), 'src', 'fonts', 'NotoSansJP-Regular.otf');
  const font = await opentype.load(filePath);
  const path = font.getPath(text, POSITION_X, POSITION_Y, FONT_SIZE);
  path.fill = FILL;
  path.stroke = STORKE;

  const offset: Coordinates = { x: 0, y: 0 };
  const startPoint: Coordinates = { x: Infinity, y: Infinity };
  const endPoint: Coordinates = { x: -Infinity, y: -Infinity };

  const commands = path.commands;
  commands.forEach((command) => {
    if (command.type === 'Z') return;

    if (startPoint.x > command.x) startPoint.x = command.x;
    if (startPoint.y > command.y) startPoint.y = command.y;
    if (endPoint.x < command.x) endPoint.x = command.x;
    if (endPoint.y < command.y) endPoint.y = command.y;
  });

  offset.x = -startPoint.x;
  offset.y = -startPoint.y;

  const selectedArea: SelectedArea = { x: 0, y: 0, w: 0, h: 0 };
  selectedArea.w = endPoint.x - startPoint.x;
  selectedArea.h = endPoint.y - startPoint.y;

  const textPath: TextPath = {
    ...path,
    offset,
    selectedArea,
    text,
    isSelected: false,
    path2D: undefined,
    selectedPath2D: undefined,
  };

  return res.status(200).json({ textPath });
}
