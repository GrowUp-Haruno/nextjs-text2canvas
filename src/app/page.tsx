'use client';

import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { Canvas } from './Canvas';
import { TextInput } from './TextInput';

export default function Page() {
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();

  return (
    <div id="page" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} />
      <Canvas textPaths={textPaths} setTextPaths={setTextPaths} />
    </div>
  );
}
