import { TextPath } from '../types/TextPath';

export const getTextPath = async (text?: string): Promise<TextPath> => {
  const res = await fetch(`/api/text2path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('フェッチに失敗しました');

  const { textPath } = (await res.json()) as {
    textPath: TextPath;
  };

  return textPath;
};
