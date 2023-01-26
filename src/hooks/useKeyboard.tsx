import { Dispatch, SetStateAction, useEffect } from 'react';
import { initialTextPath } from '../commons/initialTextPath';
import { isSelectedDelete, isSelectedReset } from '../commons/setTextPathsFn';
import { TextPath } from '../types/TextPath';

type HooksArg = {
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
  setSelectedPath: Dispatch<SetStateAction<TextPath>>;
};
type HooksReturn = void;
type CustomHooks = (hooksArg: HooksArg) => HooksReturn;

export const useKeyboard: CustomHooks = ({ textPaths, setTextPaths, setSelectedPath }) => {
  useEffect(() => {
    document.addEventListener('keyup', handleKeyup);
    return () => {
      document.removeEventListener('keyup', handleKeyup);
    };
  }, [textPaths]);

  const handleKeyup = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setTextPaths(isSelectedReset);
      setSelectedPath(initialTextPath);
    }
    if (event.key === 'Delete') {
      setTextPaths(isSelectedDelete);
      setSelectedPath(initialTextPath);
    }
  };

  return {};
};
