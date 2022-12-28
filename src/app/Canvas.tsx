'use client';
import { FC, memo, useEffect } from 'react';
import { pathDraw } from '../commons/pathDraw';
import { useCanvas } from '../hooks/useCanvas';
import { useSystem } from '../hooks/useSystem';
import { TextPath } from '../types/TextPath';

export const Canvas: FC<{
  textPaths: TextPath[];
  isLoading: boolean;
  setTextPaths: React.Dispatch<React.SetStateAction<TextPath[]>>;
}> = memo(({ textPaths, isLoading, setTextPaths }) => {
  const { system } = useSystem();
  const { canvas, canvasCtx, selectedArea, handleDown } = useCanvas({ textPaths, setTextPaths, system });

  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (textPaths === null) return;

    canvasCtx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    textPaths.forEach((textPath, i) => {
      if (canvasCtx.current === null) return;

      pathDraw({
        ctx: canvasCtx.current,
        textPath,
        offsetX: textPath.offset.x,
        offsetY: textPath.offset.y,
      });
    });
    pathDraw({
      ctx: canvasCtx.current,
      textPath: selectedArea,
      offsetX: selectedArea.offset.x,
      offsetY: selectedArea.offset.y,
    });
  }, [textPaths, selectedArea]);

  return (
    <div>
      {isLoading && <p>通信中...</p>}
      <canvas
        id="canvas"
        onMouseDown={handleDown}
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
