'use client';
import { memo } from 'react';
import { Canvas } from './Canvas';
import { useTextToCanvas } from './hook';
import { TextInput } from './TextInput';

export const TextToCanvas = memo(() => {
  const { inputText, isLoading, textPath, changeInput, changeText2Path } =
    useTextToCanvas();

  return (
    <div>
      <TextInput
        inputText={inputText}
        isLoading={isLoading}
        changeInput={changeInput}
        changeText2Path={changeText2Path}
      />
      <Canvas textPath={textPath} isLoading={isLoading} />
    </div>
  );
});

export type TPath = {
  commands: opentype.PathCommand[];
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};
