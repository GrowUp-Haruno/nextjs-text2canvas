'use client';
import { FC, memo } from 'react';

export const Canvas: FC = memo(() => {
  return (
    <div id="canvasWrap" style={{ width: '100%', height: '100%', backgroundColor: '#E6E6E6' }}>
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
