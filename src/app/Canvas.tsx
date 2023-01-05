'use client';
import { FC, memo } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useKeyboard } from '../hooks/useKeyboard';
import { TextPath } from '../types/TextPath';

export const Canvas: FC<{
  textPaths: TextPath[];
  setTextPaths: React.Dispatch<React.SetStateAction<TextPath[]>>;
}> = memo(({ textPaths, setTextPaths }) => {
  const { handleDown, setSelectedArea } = useCanvas({
    textPaths,
    setTextPaths,
  });

  useKeyboard({ textPaths, setTextPaths, setSelectedArea });

  return (
    <div>
      <canvas
        id="canvas"
        onMouseDown={handleDown}
        style={{
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
