import { Dispatch, SetStateAction, useEffect } from 'react';
import { isSelectedReset } from '../commons/setTextPathsFn';
import { TextPath } from '../types/TextPath';

type HooksArg = { textPaths: TextPath[]; setTextPaths: Dispatch<SetStateAction<TextPath[]>> };
type HooksReturn = void;
type CustomHooks = (hooksArg: HooksArg) => HooksReturn;

export const useKeyboard: CustomHooks = ({ textPaths, setTextPaths }) => {
  useEffect(() => {
    document.addEventListener('keyup', handleKeyup);
    return () => {
      document.removeEventListener('keyup', handleKeyup);
    };
  }, [textPaths]);

  const handleKeyup = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setTextPaths(isSelectedReset);
  };

  return {};
};
