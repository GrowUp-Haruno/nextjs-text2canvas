import { useEffect, useRef, Dispatch, SetStateAction, MutableRefObject, useState } from 'react';
import { initialTextPath } from '../commons/initialTextPath';
import { getNewPosition } from '../commons/setSelectedTextPath';
import { isSelectedReset } from '../commons/setTextPathsFn';
import { System } from '../types/System';
import { TextPath } from '../types/TextPath';

type HooksArg = {
  system: MutableRefObject<System>;
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
};

export const useCanvas = ({ system, textPaths, setTextPaths }: HooksArg) => {
  const [selectedTextPath, setSelectedTextPath] = useState(initialTextPath);

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const filterTextPaths = useRef<TextPath[]>([]);
  const hitTextPath = useRef<TextPath>(initialTextPath);
  const initialX = useRef(0);
  const initialY = useRef(0);

  useEffect(() => {
    canvas.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas.current === null) return;
    canvasCtx.current = canvas.current.getContext('2d');

    return () => {
      if (canvas.current === null) return;
      canvas.current.removeEventListener('mousemove', handleMove);
      canvas.current.removeEventListener('mouseout', handleOut);
      canvas.current.removeEventListener('mouseup', handleUp);
    };
  }, []);

  function handleDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (canvas.current === null) return;
    setTextPaths(isSelectedReset);
    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;
    initialX.current = clickPositionX;
    initialY.current = clickPositionY;

    const textPathMaxIndex = textPaths.length - 1;
    const textPathHit = textPaths
      .slice()
      .reverse()
      .some((textPath, i) => {
        // クリックした座標が文字列の枠内か判定
        if (clickPositionX < textPath.offset.x) return false;
        if (clickPositionX > textPath.endPoint.x) return false;
        if (clickPositionY < textPath.endPoint.y) return false;
        if (clickPositionY > textPath.offset.y) return false;

        const someIndex = textPathMaxIndex - i;
        filterTextPaths.current = textPaths.filter((_, filterIndex) => someIndex !== filterIndex);

        const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
        const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
        if (!(pressedMacCommandKey || pressedWinControlKey))
          filterTextPaths.current = filterTextPaths.current.map((textPath) => ({ ...textPath, isSelected: false }));

        hitTextPath.current = textPath;
        hitTextPath.current.isSelected = true;

        setTextPaths([...filterTextPaths.current, hitTextPath.current]);

        setSelectedTextPath((prev) => {
          const newPosition = getNewPosition({ prev, textPath: hitTextPath.current });
          return { ...prev, isSelected: true, offset: newPosition.offset, endPoint: newPosition.endPoint };
        });

        return true;
      });

    if (textPathHit) canvas.current.addEventListener('mousemove', handleMove);
    if (!textPathHit) canvas.current.addEventListener('mousemove', handleDrag);

    canvas.current.addEventListener('mouseup', handleUp);
    canvas.current.addEventListener('mouseout', handleOut);
  }

  function handleDrag(event: MouseEvent) {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    const distanceOriginToDrag_X = event.x - Math.floor(rect.x) - initialX.current;
    const distanceOriginToDrag_Y = event.y - Math.floor(rect.y) - initialY.current;

    const newTextPath = textPaths.map((textPath) => {
      const distanceOriginToOffset_X = textPath.offset.x - initialX.current;
      const distanceOriginToOffset_Y = textPath.offset.y - initialY.current;
      const distanceOriginToEndpoint_X = textPath.endPoint.x - initialX.current;
      const distanceOriginToEndpoint_Y = textPath.endPoint.y - initialY.current;

      const isBetweenOffsetToEndpoint_X = distanceOriginToOffset_X < 0 && distanceOriginToEndpoint_X > 0;
      const isBetweenOffsetToEndpoint_Y = distanceOriginToOffset_Y > 0 && distanceOriginToEndpoint_Y < 0;

      let isDragLongerThanOffset_X = false;
      if (distanceOriginToOffset_X < 0) isDragLongerThanOffset_X = -distanceOriginToDrag_X > -distanceOriginToOffset_X;
      if (distanceOriginToOffset_X >= 0) isDragLongerThanOffset_X = distanceOriginToDrag_X > distanceOriginToOffset_X;

      let isDragLongerThanOffset_Y = false;
      if (distanceOriginToOffset_Y < 0) isDragLongerThanOffset_Y = -distanceOriginToDrag_Y > -distanceOriginToOffset_Y;
      if (distanceOriginToOffset_Y >= 0) isDragLongerThanOffset_Y = distanceOriginToDrag_Y > distanceOriginToOffset_Y;

      let isDragLongerThanEndpoint_X = false;
      if (distanceOriginToEndpoint_X < 0)
        isDragLongerThanEndpoint_X = -distanceOriginToDrag_X > -distanceOriginToEndpoint_X;
      if (distanceOriginToEndpoint_X >= 0)
        isDragLongerThanEndpoint_X = distanceOriginToDrag_X > distanceOriginToEndpoint_X;

      let isDragLongerThanEndpoint_Y = false;
      if (distanceOriginToEndpoint_Y < 0)
        isDragLongerThanEndpoint_Y = -distanceOriginToDrag_Y > -distanceOriginToEndpoint_Y;
      if (distanceOriginToEndpoint_Y >= 0)
        isDragLongerThanEndpoint_Y = distanceOriginToDrag_Y > distanceOriginToEndpoint_Y;

      textPath.isSelected = false;
      if (isBetweenOffsetToEndpoint_X && isDragLongerThanOffset_Y) textPath.isSelected = true;
      if (isBetweenOffsetToEndpoint_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
      if (isBetweenOffsetToEndpoint_Y && isDragLongerThanOffset_X) textPath.isSelected = true;
      if (isBetweenOffsetToEndpoint_Y && isDragLongerThanEndpoint_X) textPath.isSelected = true;

      if (isDragLongerThanOffset_X && isDragLongerThanOffset_Y) textPath.isSelected = true;
      if (isDragLongerThanOffset_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
      if (isDragLongerThanEndpoint_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
      if (isDragLongerThanEndpoint_X && isDragLongerThanOffset_Y) textPath.isSelected = true;

      return textPath;
    });
    setTextPaths([...newTextPath]);
  }

  function handleMove(event: MouseEvent) {
    if (canvas.current === null) return;
    if (hitTextPath.current === undefined) return;

    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.x - Math.floor(rect.x);
    const clickPositionY = event.y - Math.floor(rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    if (isMovableX) {
      hitTextPath.current.offset.x += clickPositionX - initialX.current;
      hitTextPath.current.endPoint.x += clickPositionX - initialX.current;
      initialX.current = clickPositionX;
    }
    if (isMovableY) {
      hitTextPath.current.offset.y += clickPositionY - initialY.current;
      hitTextPath.current.endPoint.y += clickPositionY - initialY.current;
      initialY.current = clickPositionY;
    }
    setTextPaths([...filterTextPaths.current, hitTextPath.current]);
    setSelectedTextPath((prev) => {
      const newPosition = getNewPosition({ prev, textPath: hitTextPath.current });
      return { ...prev, isSelected: true, offset: newPosition.offset, endPoint: newPosition.endPoint };
    });
  }

  function handleUp(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mousemove', handleDrag);
    canvas.current.removeEventListener('mouseout', handleOut);
    canvas.current.removeEventListener('mouseup', handleUp);
  }

  function handleOut(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mousemove', handleDrag);
    canvas.current.removeEventListener('mouseup', handleUp);
    canvas.current.removeEventListener('mouseout', handleOut);
  }
  return { canvas, canvasCtx, selectedTextPath, handleDown };
};
