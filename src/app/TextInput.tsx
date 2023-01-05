'use client';
import { memo, FC } from 'react';

export const TextInput: FC<{
  inputText: string;
  isLoading: boolean;
  changeInput: React.ChangeEventHandler<HTMLInputElement>;
  addText2Path: React.MouseEventHandler<HTMLButtonElement>;
}> = memo(({ inputText, isLoading, changeInput, addText2Path }) => {
  return (
    <div>
      <input type="text" onChange={changeInput} value={inputText} disabled={isLoading} />
      <button onClick={addText2Path} disabled={isLoading}>
        追加
      </button>
    </div>
  );
});
