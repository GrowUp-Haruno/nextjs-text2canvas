import { useEffect, useRef, useState } from 'react';
import { getPath2D } from '../../commons/getPath2D';
import { getSelectedPath2D } from '../../commons/getSelectedPath2D';
import { getTextPath } from '../../commons/getTextPath';
import { EventListener } from '../../commons/useEventListener';
import { TextPath } from '../../types/TextPath';

export const useText2Path = () => {
  const maxNameLength = 20;
  const [inputText, setInputText] = useState<string>('');
  const [textPaths, setTextPaths] = useState<TextPath[]>([]);

  const modal = useRef<HTMLDivElement | null>(null);
  const modalcontent = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    (async () => {
      const modalElement = document.getElementById('text2path-modal');
      if (!(modalElement instanceof HTMLDivElement)) return;
      modal.current = modalElement;

      const contentElement = document.getElementById('text2path-modalcontent');
      if (!(contentElement instanceof HTMLDivElement)) return;
      modalcontent.current = contentElement;

      const inputElement = document.getElementById('text2path-input');
      if (!(inputElement instanceof HTMLInputElement)) return;
      input.current = inputElement;

      const buttonElement = document.getElementById('text2path-button');
      if (!(buttonElement instanceof HTMLButtonElement)) return;
      button.current = buttonElement;

      input.current.disabled = true;
      button.current.disabled = true;

      await getTextPath(inputText);
    })();
  }, []);

  const changeInput: EventListener<'input'> = async (event) => {
    const regex = /[&'`"<>]/g;
    if (!(event.target instanceof HTMLInputElement)) return;
    if (regex.test(event.target.value)) return (event.target.value = inputText);
    if (!(event.target.value.length <= maxNameLength)) return (event.target.value = inputText);
    event.target.setAttribute('value', event.target.value);
    setInputText(event.target.value);
    return;
  };

  const addText2Path: EventListener<'click'> = async () => {
    modal.current!.style.display = 'none';
    input.current!.value = '';
    input.current!.disabled = true;
    button.current!.disabled = true;
    
    const canvas = document.getElementById('canvas');
    canvas!.style.cursor = 'wait';

    const textPath: TextPath = await getTextPath(inputText);
    const comandsExists = textPath.commands.length !== 0;
    if (comandsExists) {
      const ToolPalettesHeight = 48; //px
      const shiftX = Number(modalcontent.current!.style.left.replace('px', ''));
      const shiftY = Number(modalcontent.current!.style.top.replace('px', '')) - ToolPalettesHeight;
      textPath.offset.x += shiftX;
      textPath.offset.y += shiftY;
      textPath.selectedArea.x += shiftX;
      textPath.selectedArea.y += shiftY;
      textPath.selectedArea.centerX += shiftX;
      textPath.selectedArea.centerY += shiftY;
      textPath.path2D = getPath2D(textPath);
      textPath.selectedPath2D = getSelectedPath2D({ textPath });
      setTextPaths((prev) => [...prev, textPath]);
    }

    setInputText('');
    canvas!.style.cursor = 'text';
  };

  useEffect(() => {
    input.current!.addEventListener('input', changeInput);
    button.current!.addEventListener('click', addText2Path);
    return () => {
      input.current!.removeEventListener('input', changeInput);
      button.current!.removeEventListener('click', addText2Path);
    };
  }, [inputText]);

  return { textPaths, setTextPaths };
};