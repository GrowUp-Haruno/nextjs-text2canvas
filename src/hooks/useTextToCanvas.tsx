import { useEffect, useState } from 'react';
import { getTextPath } from '../commons/getTextPath';
import { isSelectedReset } from '../commons/setTextPathsFn';
import { TextPath } from '../types/TextPath';

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

  /**
   * Todo
   * textPathをスタックしていく方式になっているので関数名を変更する
   */
  const changeText2Path: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsLoading(true);

    const textPath: TextPath = await getTextPath(inputText);
    setTextPaths((prev) => {
      const SHIFT_MAGNIFICATION: number = 8; //px
      const shiftPosition = SHIFT_MAGNIFICATION * (prev.length + 1);

      textPath.offset.x += shiftPosition;
      textPath.offset.y += shiftPosition;
      textPath.endPoint.x += shiftPosition;
      textPath.endPoint.y += shiftPosition;

      return [...prev, textPath];
    });

    setInputText('');
    setIsLoading(false);
  };

  return { inputText, isLoading, textPaths, changeInput, changeText2Path, setTextPaths };
};
