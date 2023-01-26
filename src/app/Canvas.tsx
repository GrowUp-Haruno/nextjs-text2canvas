'use client';
import { FC, memo } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useKeyboard } from '../hooks/useKeyboard';
import { TextPath } from '../types/TextPath';

export const Canvas: FC<{
  textPaths: TextPath[];
  setTextPaths: React.Dispatch<React.SetStateAction<TextPath[]>>;
}> = memo(({ textPaths, setTextPaths }) => {
  const { setSelectedPath } = useCanvas({
    textPaths,
    setTextPaths,
  });

  useKeyboard({ textPaths, setTextPaths, setSelectedPath });

  return (
    <div>
      <canvas
        id="canvas"
        style={{
          backgroundColor: '#E6E6E6',
        }}
        width={1000}
        height={400}
      />
    </div>
  );
});
