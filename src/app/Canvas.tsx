'use client';
import { useEffect, FC, useRef, memo, useState } from 'react';
import { pathDraw } from '../commons/pathDraw';
import { TPath } from './TextToCanvas';

export const Canvas: FC<{
  textPath: TPath | null;
  isLoading: boolean;
}> = memo(({ textPath, isLoading }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  
  const positionX = useRef(0);
  const positionY = useRef(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (canvas.current === null) return;
    canvas.current.width = 500;
    canvas.current.height = 300;
    canvasCtx.current = canvas.current.getContext('2d');
    return () => {
      canvas.current?.removeEventListener('mousemove', handleMove);
      canvas.current?.removeEventListener('mouseout', handleOut);
      canvas.current?.removeEventListener('mouseup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (textPath === null) return;

    canvasCtx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    pathDraw({ ctx: canvasCtx.current, path: textPath, offsetX, offsetY });
  }, [textPath, offsetX, offsetY]);

  function handleDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
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

  return (
    <div id="field">
      {isLoading && <p>通信中...</p>}
      <canvas
        ref={canvas}
        style={{
          display: isLoading ? 'none' : undefined,
          backgroundColor: '#E6E6E6',
        }}
        onMouseDown={handleDown}
      />
      <p>Shiftキーを押すと上下移動</p>
      <p>Shift + Altで左右移動</p>
    </div>
  );
});
