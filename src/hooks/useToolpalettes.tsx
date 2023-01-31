import { useEffect, useMemo, useRef, useState } from 'react';

import styles from '../styles/page.module.css';

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

  return { selectedTool, tools };
};
