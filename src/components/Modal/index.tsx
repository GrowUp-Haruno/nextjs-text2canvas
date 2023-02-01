'use client';
import styles from './modal.module.css';

import { FC, ReactNode } from 'react';

export const Modal: FC<{ originalId: string; children: ReactNode }> = ({ originalId, children }) => {
  return (
    <div id={`${originalId}-modal`} className={styles.modal}>
      <div id={`${originalId}-modalcontent`} className={styles.modalcontent}>
        {children}
      </div>
    </div>
  );
};
