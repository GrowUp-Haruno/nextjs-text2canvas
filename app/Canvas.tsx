'use client';
import { useEffect, FC, useRef } from 'react';
import { TPath } from './TextToCanvas';

export const Canvas: FC<{
  textPath: TPath | null;
}> = ({ textPath }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvas.current === null) return;
    canvas.current.width = 500;
    canvas.current.height = 300;
    canvasCtx.current = canvas.current.getContext('2d');

    if (canvasCtx.current === null) return;
    if (textPath === null) return;

    pathDraw({ ctx: canvasCtx.current, path: textPath });
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
    pathDraw({ ctx: canvasCtx.current, path: textPath });
  }, [textPath]);

  return <canvas ref={canvas} />;
};

const pathDraw = ({
  ctx,
  path,
}: {
  ctx: CanvasRenderingContext2D;
  path: TPath;
}) => {
  ctx.beginPath();
  for (let i = 0; i < path.commands.length; i += 1) {
    const cmd = path.commands[i];
    if (cmd.type === 'M') {
      ctx.moveTo(cmd.x, cmd.y);
    } else if (cmd.type === 'L') {
      ctx.lineTo(cmd.x, cmd.y);
    } else if (cmd.type === 'C') {
      ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    } else if (cmd.type === 'Q') {
      ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
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
