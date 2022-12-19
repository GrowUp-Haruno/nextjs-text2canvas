'use client';
import { useEffect, FC, useRef, memo, useState } from 'react';
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

    canvasCtx.current.clearRect(
      0,
      0,
      canvas.current.width,
      canvas.current.height
    );
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

const pathDraw = ({
  ctx,
  path,
  offsetX,
  offsetY,
}: {
  ctx: CanvasRenderingContext2D;
  path: TPath;
  offsetX: number;
  offsetY: number;
}) => {
  ctx.beginPath();
  for (let i = 0; i < path.commands.length; i += 1) {
    const cmd = path.commands[i];
    if (cmd.type === 'M') {
      ctx.moveTo(cmd.x + offsetX, cmd.y + offsetY);
    } else if (cmd.type === 'L') {
      ctx.lineTo(cmd.x + offsetX, cmd.y + offsetY);
    } else if (cmd.type === 'C') {
      ctx.bezierCurveTo(
        cmd.x1 + offsetX,
        cmd.y1 + offsetY,
        cmd.x2 + offsetX,
        cmd.y2 + offsetY,
        cmd.x + offsetX,
        cmd.y + offsetY
      );
    } else if (cmd.type === 'Q') {
      ctx.quadraticCurveTo(
        cmd.x1 + offsetX,
        cmd.y1 + offsetY,
        cmd.x + offsetX,
        cmd.y + offsetY
      );
    } else if (cmd.type === 'Z') {
      ctx.closePath();
    }
  }

  if (path.fill) {
    ctx.fillStyle = path.fill;
    ctx.fill();
  }

  if (path.stroke) {
    ctx.strokeStyle = path.stroke;
    ctx.lineWidth = path.strokeWidth;
    ctx.stroke();
  }
};
