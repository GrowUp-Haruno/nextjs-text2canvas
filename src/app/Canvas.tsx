'use client';
import { FC, memo } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useKeyboard } from '../hooks/useKeyboard';
import { TextPath } from '../types/TextPath';

export const Canvas: FC<{
  textPaths: TextPath[];
  setTextPaths: React.Dispatch<React.SetStateAction<TextPath[]>>;
}> = memo(({ textPaths, setTextPaths }) => {
  const { canvasProps, setSelectedArea } = useCanvas({
    textPaths,
    setTextPaths,
  });

  useKeyboard({ textPaths, setTextPaths, setSelectedArea });

  return (
    <div>
      <canvas
        id="canvas"
        onMouseDown={canvasProps.onMouseDown}
        onMouseUp={canvasProps.onMouseUp}
        onMouseMove={canvasProps.onMouseMove}
        onMouseOut={canvasProps.onMouseOut}
        style={{
          backgroundColor: '#E6E6E6',
        }}
        width={1000}
        height={400}
      />
    </div>
  );
});
