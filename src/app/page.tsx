'use client';
import { Text2Path } from '../components/Text2Path';
import { useCanvas } from '../hooks/useCanvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { useToolpalettes } from '../hooks/useToolpalettes';
import styles from '../styles/page.module.css';

export default function Page() {
  const { selectedTool, tools } = useToolpalettes();
  const { inputText, isLoading, textPaths, changeInput, addText2Path, setTextPaths } = useTextToCanvas();
  useCanvas({
    textPaths,
    setTextPaths,
    selectedTool,
  });

  return (
    <div id="page" style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <div id="toolpalettes" className={styles.toolpalettes} children={tools} />
      <canvas id="canvas" className={styles.canvas} />
      <Text2Path />
    </div>
  );
}
