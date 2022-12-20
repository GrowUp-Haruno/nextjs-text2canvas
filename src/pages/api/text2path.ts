import type { NextApiRequest, NextApiResponse } from 'next';
import opentype from 'opentype.js';
import * as fp from 'path';
import { Coordinates, TextPath } from '../../types/TextPath';

type Data = {
  textPath: TextPath;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.log(req.method);
  console.log(req.body);

  if (req.method !== 'POST') return res.status(500);

  const MAX_TEXT_LENGTH = 20;
  const POSITION_X = 0;
  const POSITION_Y = 80;
  const FONT_SIZE = 76;
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

  const offset: Coordinates = { x: POSITION_X, y: POSITION_Y };
  const endPoint: Coordinates = { x: 0, y: 0 };
  const commands = path.commands;
  commands.forEach((command) => {
    if (command.type === 'Z') return;
    if (endPoint.x < command.x + offset.x) endPoint.x = command.x + offset.x;
    if (endPoint.y < command.y + offset.y) endPoint.y = command.y + offset.y;
  });
  const textPath: TextPath = {
    ...path,
    offset,
    endPoint,
  };

  return res.status(200).json({ textPath });
}
