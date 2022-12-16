'use client';
import { memo, FC } from 'react';

export const TextInput: FC<{
  inputText: string;
  isLoading: boolean;
  changeInput: React.ChangeEventHandler<HTMLInputElement>;
  changeText2Path: React.MouseEventHandler<HTMLButtonElement>;
}> = memo(({ inputText, isLoading, changeInput, changeText2Path }) => {
  return (
    <div>
      <input
        type="text"
        onChange={changeInput}
        value={inputText}
        disabled={isLoading}
      />
      <button onClick={changeText2Path} disabled={isLoading}>
        変換
      </button>
    </div>
  );
});
