'use client';
import { FC, memo, useEffect } from 'react';
import { pathDraw } from '../commons/pathDraw';
import { useCanvas } from '../hooks/useCanvas';
import { TPath } from './TextToCanvas';

export const Canvas: FC<{
  textPath: TPath | null;
  isLoading: boolean;
}> = memo(({ textPath, isLoading }) => {
  const { canvas, canvasCtx, offsetX, offsetY } = useCanvas(textPath);

  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (textPath === null) return;

    canvasCtx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    pathDraw({ ctx: canvasCtx.current, path: textPath, offsetX, offsetY });
  }, [textPath, offsetX, offsetY]);
  
  return (
    <div>
      {isLoading && <p>通信中...</p>}
      <canvas
        id="canvas"
        style={{
          display: isLoading ? 'none' : undefined,
          backgroundColor: '#E6E6E6',
        }}
        width={500}
        height={300}
      />
      <p>Shiftキーを押すと上下移動</p>
      <p>Shift + Altで左右移動</p>
    </div>
  );
});
