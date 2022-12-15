import type { NextApiRequest, NextApiResponse } from 'next';
import opentype from 'opentype.js';

import { TPath } from '../../app/TextToCanvas';

type Data = {
  path: TPath;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') return res.status(500);

  const MAX_TEXT_LENGTH = 20;
  const POSITION_X = 0;
  const POSITION_Y = 80;
  const FONT_SIZE = 76;
  const FILL = 'red';
  const STORKE = 'red';

  const { text }: { text: string } = req.body;
  const regex = /[&'`"<>]/g;
  if (regex.test(text)) return res.status(500);
  if (!(text.length <= MAX_TEXT_LENGTH)) return res.status(500);

  const font = await opentype.load('fonts/NotoSansJP-Regular.otf');
  const path = font.getPath(text, POSITION_X, POSITION_Y, FONT_SIZE);
  path.fill = FILL;
  path.stroke = STORKE;
  res.status(200).json({ path });
}
