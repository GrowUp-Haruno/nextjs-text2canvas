import { FC } from 'react';
import styles from '../styles/toolpalettes.module.css';

export const ToolPalettes: FC<{ tools: JSX.Element[] }> = ({ tools }) => {
  return (
    <div id="toolpalettes" className={styles.toolpalettes}>
      {tools}
    </div>
  );
};
