'use client';
import { memo, FC, CSSProperties } from 'react';

export const TextInput: FC<{
  inputText: string;
  isLoading: boolean;
  changeInput: React.ChangeEventHandler<HTMLInputElement>;
  addText2Path: React.MouseEventHandler<HTMLButtonElement>;
}> = memo(({ inputText, isLoading, changeInput, addText2Path }) => {
  const cursorStyle: CSSProperties | undefined = { cursor: isLoading === true ? 'progress' : undefined };
  const buttonDisabled = isLoading || inputText === '';

  return (
    <div style={{display:"flex",flexDirection:"row",gap:"8px"}}>
      <input type="text" onChange={changeInput} value={inputText} disabled={isLoading} style={cursorStyle} />
      <button onClick={addText2Path} disabled={buttonDisabled} style={cursorStyle}>
        追加
      </button>
    </div>
  );
});
