import { useEffect, useState } from 'react';
import { getTextPath } from '../commons/getTextPath';
import { Coordinates, Path, TextPath } from '../types/TextPath';

export const useTextToCanvas = () => {
  const maxNameLength = 20;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [textPaths, setTextPaths] = useState<TextPath[]>([]);

  useEffect(() => {
    (async () => {
      await getTextPath(inputText);
      setIsLoading(false);
    })();
  }, []);

  const changeInput: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const regex = /[&'`"<>]/g;
    if (regex.test(e.target.value)) return;
    if (!(e.target.value.length <= maxNameLength)) return;

    setInputText(() => e.target.value);
  };

  const changeText2Path: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsLoading(true);

    const textPath: TextPath = await getTextPath(inputText);
    setTextPaths((prev) => [...prev, textPath]);

    setIsLoading(false);
  };

  return { inputText, isLoading, textPaths, changeInput, changeText2Path };
};