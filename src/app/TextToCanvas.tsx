'use client';
import { memo } from 'react';
import { Canvas } from './Canvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { TextInput } from './TextInput';

export const TextToCanvas = memo(() => {
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();

  return (
    <div>
      <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} />
      <Canvas textPaths={textPaths} setTextPaths={setTextPaths} />
    </div>
  );
});
