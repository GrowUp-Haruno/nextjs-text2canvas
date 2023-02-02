'use client';

import { Modal } from '../Modal';

export const Text2Path = () => {
  return (
    <Modal originalId="text2path">
      <input
        id="text2path-input"
        type="text"
        autoComplete="off"
        style={{ padding: '8px 8px' }}
      />
      <button id="text2path-button" children="追加" style={{ height: '100%' }} />
    </Modal>
  );
};
