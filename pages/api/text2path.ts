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

  const maxNameLength = 20;
  const { text }: { text: string } = req.body;
  const regex = /[&'`"<>]/g;
  if (regex.test(text)) return res.status(500);
  if (!(text.length <= maxNameLength)) return res.status(500);

  const font = await opentype.load('fonts/NotoSansJP-Regular.otf');
  const path = font.getPath(text, 0, 75, 72);
  res.status(200).json({ path });
}
