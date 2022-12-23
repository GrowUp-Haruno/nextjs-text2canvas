import { Dispatch, SetStateAction, useEffect } from 'react';
import { isSelectedDelete, isSelectedReset } from '../commons/setTextPathsFn';
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
    console.log(event.key);
    
    if (event.key === 'Escape') setTextPaths(isSelectedReset);
    if (event.key === 'Delete') setTextPaths(isSelectedDelete);
  };

  return {};
};
