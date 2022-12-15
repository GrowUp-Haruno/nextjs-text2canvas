import { useEffect, useState } from 'react';
import { TPath } from './TextToCanvas';

export const useTextToCanvas = () => {
  const maxNameLength = 20;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [textPath, setTextPath] = useState<TPath | null>(null);

  useEffect(() => {
    (async () => {
      setTextPath(await getPath(inputText));
      setIsLoading(false);
    })();
  }, []);

  const changeInput: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const regex = /[&'`"<>]/g;
    if (regex.test(e.target.value)) return;
    if (!(e.target.value.length <= maxNameLength)) return;

    setInputText(() => e.target.value);
  };

  const changeText2Path: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    setIsLoading(true);
    setTextPath(await getPath(inputText));
    setIsLoading(false);
  };

  return { inputText, isLoading, textPath, changeInput, changeText2Path };
};

const getPath = async (text?: string) => {
  const res = await fetch(`/api/text2path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  // if (!res.ok) {
  //   throw new Error('フェッチに失敗しました');
  // }

  const { path } = (await res.json()) as {
    path: TPath;
  };

  return path;
};
