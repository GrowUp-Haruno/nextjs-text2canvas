import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './toolpalettes.module.css';

export type ToolId = 'tool-select' | 'tool-text2Path';
type ToolObj = {
  icon: string;
  id: ToolId;
};
type ToolList = ToolObj[];

export const useToolpalettes = () => {
  const [selectedTool, setSelectedTool] = useState<ToolId>('tool-select');
  const toolList: ToolList = [
    { icon: '↖︎', id: 'tool-select' },
    { icon: 'T', id: 'tool-text2Path' },
  ];

  const tools = useMemo(
    () =>
      toolList.map((tool) => {
        const selected = tool.id === selectedTool ? styles.selected : styles.unselected;

        return (
          <div
            id="text2path"
            className={`${styles.tool} ${selected}`}
            key={tool.id}
            onClick={() => {
              setSelectedTool(tool.id);
            }}
          >
            <div id={tool.id}>{tool.icon}</div>
          </div>
        );
      }),
    [selectedTool]
  );

  const text2path_button_click = () => {
    setSelectedTool('tool-select');
  };

  useEffect(() => {
    document.getElementById('text2path-button')?.addEventListener('click', text2path_button_click);
    return () => {
      document.getElementById('text2path-button')?.removeEventListener('click', text2path_button_click);
    };
  }, []);

  return { selectedTool, tools };
};
