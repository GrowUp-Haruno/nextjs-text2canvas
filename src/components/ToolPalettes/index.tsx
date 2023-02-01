'use client';
import { FC } from 'react';
import styles from './toolpalettes.module.css';

export const ToolPalettes: FC<{ tools: JSX.Element[] }> = ({ tools }) => {
  return <div id="toolpalettes" className={styles.toolpalettes} children={tools} />;
};
