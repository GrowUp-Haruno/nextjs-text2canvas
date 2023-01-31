'use client';
import { FC, memo } from 'react';

export const Canvas: FC = memo(() => {
  return (
    <div id="canvasWrap" style={{ backgroundColor: '#E6E6E6',height:'calc(100%-48px)' }}>
      <canvas
        id="canvas"
        style={{
          backgroundColor: '#E6E6E6',
        }}
        width={10}
        height={10}
      />
    </div>
  );
});
