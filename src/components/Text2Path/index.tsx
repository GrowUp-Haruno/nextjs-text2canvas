'use client';
import styles from './text2path.module.css';

import { Modal } from '../Modal';

export const Text2Path = () => {
  return (
    <Modal originalId="text2path">
      <input id="text2path-input" type="text" autoComplete="off" className={styles.input} />
      <button id="text2path-button" children="追加" />
    </Modal>
  );
};
