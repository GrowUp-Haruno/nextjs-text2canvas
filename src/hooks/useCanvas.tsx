import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { TextPath } from '../types/TextPath';

export const useCanvas = (setTextPaths: Dispatch<SetStateAction<TextPath[]>>) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const rect = useRef<DOMRect>();

  const positionX = useRef(0);
  const positionY = useRef(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    canvas.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas.current === null) return;

    rect.current = canvas.current.getBoundingClientRect();
    canvas.current.addEventListener('mousedown', handleDown);
    canvasCtx.current = canvas.current.getContext('2d');

    return () => {
      if (canvas.current === null) return;
      canvas.current.removeEventListener('mousedown', handleDown);
      canvas.current.removeEventListener('mousemove', handleMove);
      canvas.current.removeEventListener('mouseout', handleOut);
      canvas.current.removeEventListener('mouseup', handleUp);
    };
  }, []);

  function handleDown(event: MouseEvent) {
    if (canvas.current === null) return;
    if (rect.current === undefined) return;

    initialX.current = event.screenX - rect.current.left;
    initialY.current = event.screenY - rect.current.top;

    canvas.current.addEventListener('mousemove', handleMove);
    canvas.current.addEventListener('mouseup', handleUp);
    canvas.current.addEventListener('mouseout', handleOut);
  }

  function handleMove(event: MouseEvent) {
    if (rect.current === undefined) return;

    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    if (isMovableX) {
      setOffsetX(positionX.current + event.screenX - initialX.current);
      positionX.current += event.screenX - initialX.current;
      initialX.current = event.screenX - rect.current.left;
    }
    if (isMovableY) {
      setOffsetY(positionY.current + event.screenY - initialY.current);
      positionY.current += event.screenY - initialY.current;
      initialY.current = event.screenY;
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
  return { canvas, canvasCtx, offsetX, offsetY };
};
