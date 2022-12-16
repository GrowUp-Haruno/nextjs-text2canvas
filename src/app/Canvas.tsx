'use client';
import { useEffect, FC, useRef, memo, useState } from 'react';
import { TPath } from './TextToCanvas';

export const Canvas: FC<{
  textPath: TPath | null;
  isLoading: boolean;
}> = memo(({ textPath, isLoading }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [initialX, setInitialX] = useState(0);
  const [initialY, setInitialY] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  console.log(offsetX);
  console.log(offsetY);

  useEffect(() => {
    if (canvas.current === null) return;
    canvas.current.width = 500;
    canvas.current.height = 300;
    canvasCtx.current = canvas.current.getContext('2d');

    if (canvasCtx.current === null) return;
    if (textPath === null) return;

    pathDraw({ ctx: canvasCtx.current, path: textPath, offsetX, offsetY });
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

  return (
    <div>
      {isLoading && <p>通信中...</p>}
      <canvas
        ref={canvas}
        style={{ display: isLoading ? 'none' : undefined }}
        onMouseDown={(e) => {
          setInitialX(e.screenX);
          setInitialY(e.screenY);
          setIsDrag(true);
        }}
        onMouseMove={(e) => {
          if (!isDrag) return;
          setOffsetX(positionX + e.screenX - initialX);
          setOffsetY(positionY + e.screenY - initialY);
        }}
        onMouseUp={() => {
          setInitialX(0);
          setInitialY(0);
          setPositionX(offsetX);
          setPositionY(offsetY);
          setIsDrag(false);
        }}
      />
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
