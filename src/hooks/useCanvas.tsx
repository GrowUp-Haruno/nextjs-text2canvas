import { useEffect, useRef, Dispatch, SetStateAction, MutableRefObject, useState } from 'react';
import { initialTextPath } from '../commons/initialTextPath';
import { getNewSelectedArea } from '../commons/setSelectedTextPath';
import { isSelectedReset } from '../commons/setTextPathsFn';
import { System } from '../types/System';
import { TextPath } from '../types/TextPath';

type HooksArg = {
  system: MutableRefObject<System>;
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
};

export const useCanvas = ({ system, textPaths, setTextPaths }: HooksArg) => {
  const [selectedArea, setSelectedArea] = useState(initialTextPath);

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  let nowTextPaths: TextPath[] = [];

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
    nowTextPaths = textPaths;
    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;
    initialX.current = clickPositionX;
    initialY.current = clickPositionY;

    let hitIndex = -1;
    const hitTextPath = textPaths
      .slice()
      .reverse()
      .find((textPath, i) => {
        if (clickPositionX < textPath.offset.x) return false;
        if (clickPositionX > textPath.endPoint.x) return false;
        if (clickPositionY < textPath.endPoint.y) return false;
        if (clickPositionY > textPath.offset.y) return false;
        hitIndex = textPaths.length - i - 1;
        return true;
      });

    if (hitTextPath === undefined) {
      setTextPaths(isSelectedReset);
      canvas.current.addEventListener('mousemove', handleDrag);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    if (hitTextPath.isSelected === true) {
      canvas.current.addEventListener('mousemove', handleMove);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    hitTextPath.isSelected = true;
    const unHitTextPaths = textPaths.filter((_, i) => i !== hitIndex);

    // ctrlキーによる複数選択
    const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
    const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
    if (pressedMacCommandKey || pressedWinControlKey) {
      const selectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === true);
      const unSelectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === false);
      nowTextPaths = [...unSelectedTextPaths, ...selectedTextPaths, hitTextPath];
      setTextPaths(nowTextPaths);
      setSelectedArea(getNewSelectedArea([...selectedTextPaths, hitTextPath]));
      canvas.current.addEventListener('mousemove', handleMove);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
    nowTextPaths = [...newUnHitTextPaths, hitTextPath];
    setTextPaths(nowTextPaths);

    canvas.current.addEventListener('mousemove', handleMove);
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
    setTextPaths(newTextPath);
    setSelectedArea(getNewSelectedArea(newTextPath));
  }

  function handleMove(event: MouseEvent) {
    if (canvas.current === null) return;

    const selectedTextPaths = nowTextPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = nowTextPaths.filter((textPath) => textPath.isSelected === false);

    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.x - Math.floor(rect.x);
    const clickPositionY = event.y - Math.floor(rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX) {
        selectedTextPath.offset.x += clickPositionX - initialX.current;
        selectedTextPath.endPoint.x += clickPositionX - initialX.current;
      }
      if (isMovableY) {
        selectedTextPath.offset.y += clickPositionY - initialY.current;
        selectedTextPath.endPoint.y += clickPositionY - initialY.current;
      }
      return selectedTextPath;
    });

    if (isMovableX) initialX.current = clickPositionX;
    if (isMovableY) initialY.current = clickPositionY;

    setTextPaths([...unSelectedTextPaths, ...newSelectedPaths]);
    // setSelectedArea();
    // setSelectedTextPath((prev) => {
    //   const newPosition = getNewPosition({ prev: initialTextPath, textPath: hitTextPath.current });
    //   return { ...prev, isSelected: true, offset: newPosition.offset, endPoint: newPosition.endPoint };
    // });
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
  return { canvas, canvasCtx, selectedArea, handleDown };
};
