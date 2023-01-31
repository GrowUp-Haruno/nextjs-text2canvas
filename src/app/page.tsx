'use client';
import { useCanvas } from '../hooks/useCanvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { Canvas } from './Canvas';
import { TextInput } from './TextInput';
import { ToolPalettes } from './ToolPalettes';
import { useToolpalettes } from '../hooks/useToolpalettes';

export default function Page() {
  // const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();
  // useCanvas({
  //   textPaths,
  //   setTextPaths,
  // });
  const { selectedTool, tools } = useToolpalettes();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <ToolPalettes tools={tools} />
      {/* <TextInput inputText={inputText} isLoading={isLoading} changeInput={changeInput} addText2Path={addText2Path} /> */}
      <Canvas />
    </div>
  );
}
