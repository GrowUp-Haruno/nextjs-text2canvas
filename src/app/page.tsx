'use client';
import { Text2Path } from '../components/Text2Path';
import { useText2Path } from '../components/Text2Path/useText2Path';
import { useCanvas } from '../components/Canvas/useCanvas';

import { useToolpalettes } from '../components/ToolPalettes/useToolpalettes';
import styles from './page.module.css';
import { ToolPalettes } from '../components/ToolPalettes';
import { Canvas } from '../components/Canvas';

export default function Page() {
  const { selectedTool, tools } = useToolpalettes();
  const { textPaths, setTextPaths } = useText2Path();
  useCanvas({
    textPaths,
    setTextPaths,
    selectedTool,
  });

  return (
    <div id="page" className={styles.page}>
      <ToolPalettes tools={tools} />
      <Canvas />
      <Text2Path />
    </div>
  );
}
