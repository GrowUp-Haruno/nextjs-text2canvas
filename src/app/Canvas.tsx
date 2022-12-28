'use client';
import { FC, memo } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useKeyboard } from '../hooks/useKeyboard';
import { TextPath } from '../types/TextPath';

export const Canvas: FC<{
  textPaths: TextPath[];
  isLoading: boolean;
  setTextPaths: React.Dispatch<React.SetStateAction<TextPath[]>>;
}> = memo(({ textPaths, isLoading, setTextPaths }) => {
  const { handleDown, setSelectedArea } = useCanvas({
    textPaths,
    setTextPaths,
  });

  useKeyboard({ textPaths, setTextPaths, setSelectedArea });

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
