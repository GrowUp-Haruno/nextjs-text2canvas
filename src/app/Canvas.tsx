'use client';
import { FC, memo } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { TextPath } from '../types/TextPath';
import { TextInput } from './TextInput';
import { ToolPalettes } from './ToolPalettes';

export const Canvas: FC = memo(() => {
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();
  useCanvas({
    textPaths,
    setTextPaths,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} />
      {/* <ToolPalettes /> */}
      <div id="canvasWrap" style={{ width: '100%', height: '100%', backgroundColor: '#E6E6E6'}}>
        <canvas
          id="canvas"
          style={{
            backgroundColor: '#E6E6E6',
          }}
          width={1000}
          height={400}
        />
      </div>
    </div>
  );
});
