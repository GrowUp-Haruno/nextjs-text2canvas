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
  const isSuppressionX = useRef(false);
  const isSuppressionY = useRef(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (canvas.current === null) return;
    canvas.current.width = 500;
    canvas.current.height = 300;
    canvasCtx.current = canvas.current.getContext('2d');

    document.addEventListener('keydown', handleShiftDown);

    return () => {
      document.removeEventListener('keydown', handleShiftDown);
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

  function handleShiftDown(event: KeyboardEvent) {
    if (event.key !== 'Shift') return;
    isSuppressionX.current = true;
    isSuppressionY.current = false;
    document.addEventListener('keydown', handleAltDown);
    document.addEventListener('keyup', handleShiftUp);
  }

  function handleAltDown(event: KeyboardEvent) {
    if (event.key !== 'Alt') return;
    isSuppressionX.current = false;
    isSuppressionY.current = true;
    document.addEventListener('keyup', handleAltUp);
  }

  function handleShiftUp(event: KeyboardEvent) {
    if (event.key !== 'Shift') return;
    isSuppressionX.current = false;
    isSuppressionY.current = false;
    document.removeEventListener('keydown', handleAltDown);
    document.removeEventListener('keyup', handleAltUp);
    document.removeEventListener('keyup', handleShiftUp);
  }

  function handleAltUp(event: KeyboardEvent) {
    if (event.key !== 'Alt') return;
    isSuppressionX.current = true;
    isSuppressionY.current = false;
    document.removeEventListener('keydown', handleAltDown);
    document.removeEventListener('keyup', handleAltUp);
  }

  function handleDown(
    downEvent: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) {
    if (!isSuppressionX.current) initialX.current = downEvent.screenX;
    if (!isSuppressionY.current) initialY.current = downEvent.screenY;

    canvas.current?.addEventListener('mousemove', handleMove);
    canvas.current?.addEventListener('mouseup', handleUp);
    canvas.current?.addEventListener('mouseout', handleOut);
  }

  function handleMove(moveEvent: MouseEvent) {
    if (!isSuppressionX.current)
      setOffsetX(positionX.current + moveEvent.screenX - initialX.current);
    if (!isSuppressionY.current)
      setOffsetY(positionY.current + moveEvent.screenY - initialY.current);
  }

  function handleUp(upEvent: MouseEvent) {
    if (!isSuppressionX.current)
      positionX.current += upEvent.screenX - initialX.current;
    if (!isSuppressionY.current)
      positionY.current += upEvent.screenY - initialY.current;
    canvas.current?.removeEventListener('mousemove', handleMove);
    canvas.current?.removeEventListener('mouseout', handleOut);
    canvas.current?.removeEventListener('mouseup', handleUp);
  }

  function handleOut(upEvent: MouseEvent) {
    if (!isSuppressionX.current)
      positionX.current += upEvent.screenX - initialX.current;
    if (!isSuppressionY.current)
      positionY.current += upEvent.screenY - initialY.current;
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

// const pathDraw = ({
//   ctx,
//   path,
// }: {
//   ctx: CanvasRenderingContext2D;
//   path: TPath;
// }) => {
//   ctx.beginPath();
//   for (let i = 0; i < path.commands.length; i += 1) {
//     const cmd = path.commands[i];
//     if (cmd.type === 'M') {
//       ctx.moveTo(cmd.x, cmd.y);
//     } else if (cmd.type === 'L') {
//       ctx.lineTo(cmd.x, cmd.y);
//     } else if (cmd.type === 'C') {
//       ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
//     } else if (cmd.type === 'Q') {
//       ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
//     } else if (cmd.type === 'Z') {
//       ctx.closePath();
//     }
//   }

//   if (path.fill) {
//     ctx.fillStyle = path.fill;
//     ctx.fill();
//   }

//   if (path.stroke) {
//     ctx.strokeStyle = path.stroke;
//     ctx.lineWidth = path.strokeWidth;
//     ctx.stroke();
//   }
// };
