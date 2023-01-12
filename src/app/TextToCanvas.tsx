'use client';
import { memo } from 'react';
import { Canvas } from './Canvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { TextInput } from './TextInput';
import { Explain } from './Explain';

export const TextToCanvas = memo(() => {
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} />
      <Canvas textPaths={textPaths} setTextPaths={setTextPaths} />
      <Explain />
    </div>
  );
});
