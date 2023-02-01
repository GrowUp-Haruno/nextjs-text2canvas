'use client';

import { Modal } from './Modal';

export const Text2Path = () => {
  return (
    <Modal originalId="text2path">
      <input
        id="text2path-input"
        type="text"
        autoComplete="off"
        // onChange={changeInput}
        // value={inputText}
        // disabled={isLoading}
        style={{ padding: '8px 8px' }}
      />
      {/* <button onClick={addText2Path} disabled={isLoading} children="追加" style={{ height: '100%' }} /> */}
    </Modal>
  );
};
