'use client';
import { useEffect, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useTextToCanvas } from '../hooks/useTextToCanvas';
import { useToolpalettes } from '../hooks/useToolpalettes';

import styles from '../styles/page.module.css';
import { TextInput } from './TextInput';

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
      <div
        id="canvasmodal"
        style={{
          display: 'none',
          zIndex: 1,
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div
          id="canvasmodalContet"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          <input id="canvasinput" type="text" onChange={changeInput} value={inputText} disabled={isLoading} />
          <button onClick={addText2Path} disabled={isLoading}>
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
