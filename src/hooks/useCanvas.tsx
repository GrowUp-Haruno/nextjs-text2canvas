import { useEffect, useRef, useState } from 'react';

export const useCanvas = () => {
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
    initialX.current = event.screenX;
    initialY.current = event.screenY;

    canvas.current?.addEventListener('mousemove', handleMove);
    canvas.current?.addEventListener('mouseup', handleUp);
    canvas.current?.addEventListener('mouseout', handleOut);
  }

  function handleMove(event: MouseEvent) {
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    if (isMovableX) {
      setOffsetX(positionX.current + event.screenX - initialX.current);
      positionX.current += event.screenX - initialX.current;
      initialX.current = event.screenX;
    }
    if (isMovableY) {
      setOffsetY(positionY.current + event.screenY - initialY.current);
      positionY.current += event.screenY - initialY.current;
      initialY.current = event.screenY;
    }
  }

  function handleUp(event: MouseEvent) {
    canvas.current?.removeEventListener('mousemove', handleMove);
    canvas.current?.removeEventListener('mouseout', handleOut);
    canvas.current?.removeEventListener('mouseup', handleUp);
  }

  function handleOut(event: MouseEvent) {
    canvas.current?.removeEventListener('mousemove', handleMove);
    canvas.current?.removeEventListener('mouseup', handleUp);
    canvas.current?.removeEventListener('mouseout', handleOut);
  }
  return { canvas, canvasCtx, offsetX, offsetY };
};
