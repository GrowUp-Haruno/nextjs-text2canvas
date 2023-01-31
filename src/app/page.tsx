'use client';
import { useCanvas } from '../hooks/useCanvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { Canvas } from './Canvas';
import { TextInput } from './TextInput';
import { ToolPalettes } from './ToolPalettes';

export default function Page() {
  // const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();
  // useCanvas({
  //   textPaths,
  //   setTextPaths,
  // });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <ToolPalettes />
      {/* <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} /> */}
      <Canvas />
    </div>
  );
}
