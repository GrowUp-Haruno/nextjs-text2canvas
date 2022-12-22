import { useEffect, useRef, useState, Dispatch, SetStateAction, useCallback } from 'react';
import { TextPath } from '../types/TextPath';

export const useCanvas = (textPaths: TextPath[], setTextPaths: Dispatch<SetStateAction<TextPath[]>>) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);

  const positionX = useRef(0);
  const positionY = useRef(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

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
    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;

    initialX.current = clickPositionX;
    initialY.current = clickPositionY;
    positionX.current = offsetX;
    positionY.current = offsetY;

    canvas.current.addEventListener('mousemove', handleMove);
    canvas.current.addEventListener('mouseup', handleUp);
    canvas.current.addEventListener('mouseout', handleOut);
  }

  function handleMove(event: MouseEvent) {
    if (canvas.current === null) return;

    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.x - Math.floor(rect.x);
    const clickPositionY = event.y - Math.floor(rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    if (isMovableX) {
      setOffsetX(positionX.current + clickPositionX - initialX.current);
      positionX.current += clickPositionX - initialX.current;
      initialX.current = clickPositionX;
    }
    if (isMovableY) {
      setOffsetY(positionY.current + clickPositionY - initialY.current);
      positionY.current += clickPositionY - initialY.current;
      initialY.current = clickPositionY;
    }
  }

  function handleUp(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mouseout', handleOut);
    canvas.current.removeEventListener('mouseup', handleUp);
  }

  function handleOut(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mouseup', handleUp);
    canvas.current.removeEventListener('mouseout', handleOut);
  }
  return { canvas, canvasCtx, offsetX, offsetY, handleDown };
};
