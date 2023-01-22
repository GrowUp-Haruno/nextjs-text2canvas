import { useEffect, useState } from 'react';
import { getPath2D } from '../commons/getPath2D';
import { getSelectedPath2D } from '../commons/getSelectedPath2D';
import { getTextPath } from '../commons/getTextPath';
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

  const addText2Path: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsLoading(true);

    const textPath: TextPath = await getTextPath(inputText);
    const comandsExists = textPath.commands.length !== 0;
    if (comandsExists) {
      setTextPaths((prev) => {
        const SHIFT_POSITION = 8;

        textPath.offset.x += SHIFT_POSITION;
        textPath.offset.y += SHIFT_POSITION;
        textPath.selectedArea.x += SHIFT_POSITION;
        textPath.selectedArea.y += SHIFT_POSITION;

        textPath.path2D = getPath2D(textPath);
        textPath.selectedPath2D = getSelectedPath2D({ textPath });

        return [...prev, textPath];
      });
    }

    setInputText('');
    setIsLoading(false);
  };

  return { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths };
};
