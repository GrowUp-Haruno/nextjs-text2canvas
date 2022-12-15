'use client';
import { useEffect, useState } from 'react';
import { Canvas } from './Canvas';
import { TextInput } from './TextInput';

export function TextToCanvas() {
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

  return (
    <div>
      <TextInput
        inputText={inputText}
        isLoading={isLoading}
        changeInput={changeInput}
        changeText2Path={changeText2Path}
      />
      <Canvas textPath={textPath} isLoading={isLoading} />
    </div>
  );
}

const getPath = async (text?: string) => {
  const res = await fetch('http://localhost:3000/api/text2path', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error('フェッチに失敗しました');
  }

  const { path } = (await res.json()) as {
    path: TPath;
  };

  return path;
};

export type TPath = {
  commands: opentype.PathCommand[];
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};
