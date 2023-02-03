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
  const toolSelect = useRef<HTMLDivElement | null>(null);

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

      const toolElement = document.getElementById('tool-select');
      if (!(toolElement instanceof HTMLDivElement)) return;
      toolSelect.current = toolElement;

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
      const shift = {
        x: 0,
        y: 0,
      };
      const tentativeShift = {
        x: Number(modal.current!.style.left.replace('px', '')),
        y: Number(modal.current!.style.top.replace('px', '')) - ToolPalettesHeight,
      };

      if (input.current!.style.textAlign === 'left') shift.x = tentativeShift.x;
      else shift.x = canvas!.clientWidth - textPath.selectedArea.w;

      if (tentativeShift.y + textPath.selectedArea.h < canvas!.clientHeight) shift.y = tentativeShift.y;
      else shift.y = canvas!.clientHeight - textPath.selectedArea.h;

      textPath.offset.x += shift.x;
      textPath.selectedArea.x += shift.x;
      textPath.selectedArea.centerX += shift.x;

      textPath.offset.y += shift.y;
      textPath.selectedArea.y += shift.y;
      textPath.selectedArea.centerY += shift.y;

      textPath.path2D = getPath2D(textPath);
      textPath.selectedPath2D = getSelectedPath2D({ textPath });
      setTextPaths((prev) => [...prev, textPath]);
    }

    setInputText('');
    canvas!.style.cursor = 'text';
  };

  const eventCancel: EventListener<'keydown'> = (event) => {
    if (modal.current!.style.display !== 'block') return;
    if (event.key !== 'Escape') return;
    modal.current!.style.display = 'none';
    input.current!.disabled = true;
    button.current!.disabled = true;
    input.current!.value = '';
    setInputText('');
  };

  const toolSelectClick = () => {
    modal.current!.style.display = 'none';
    input.current!.disabled = true;
    button.current!.disabled = true;
    input.current!.value = '';
    setInputText('');
  };

  useEffect(() => {
    input.current!.addEventListener('input', changeInput);
    button.current!.addEventListener('click', addText2Path);
    toolSelect.current!.addEventListener('click', toolSelectClick);
    document.addEventListener('keydown', eventCancel);
    return () => {
      input.current!.removeEventListener('input', changeInput);
      button.current!.removeEventListener('click', addText2Path);
      toolSelect.current!.removeEventListener('click', toolSelectClick);
      document.removeEventListener('keydown', eventCancel);
    };
  }, [inputText]);

  return { textPaths, setTextPaths };
};
