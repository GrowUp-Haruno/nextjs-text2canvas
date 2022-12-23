'use client';
import { memo } from 'react';
import { Canvas } from './Canvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { TextInput } from './TextInput';
import { useKeyboard } from '../hooks/useKeyboard';

export const TextToCanvas = memo(() => {
  const { inputText, isLoading, textPaths, changeInput, changeText2Path, setTextPaths } = useTextToCanvas();
  useKeyboard({ textPaths, setTextPaths });

  return (
    <div>
      <TextInput
        inputText={inputText}
        isLoading={isLoading}
        changeInput={changeInput}
        changeText2Path={changeText2Path}
      />
      <Canvas textPaths={textPaths} isLoading={isLoading} setTextPaths={setTextPaths} />
    </div>
  );
});
