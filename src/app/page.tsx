'use client';

import { useState } from 'react';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { Canvas } from './Canvas';
import { ToolPalettes } from './ToolPalettes';

export default function Page() {
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();

  return (
    <div id="page" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} /> */}
      <ToolPalettes />
      <Canvas textPaths={textPaths} setTextPaths={setTextPaths} />
    </div>
  );
}
