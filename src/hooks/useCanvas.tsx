import { useEffect, useRef, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { isSelectedReset } from '../commons/setTextPathsFn';
import { System } from '../types/System';
import { TextPath } from '../types/TextPath';

type HooksArg = {
  system: MutableRefObject<System>;
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
};

export const useCanvas = ({ system, textPaths, setTextPaths }: HooksArg) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const filterTextPaths = useRef<TextPath[]>([]);
  const hitTextPath = useRef<TextPath>();
  const initialX = useRef(0);
  const initialY = useRef(0);

  useEffect(() => {
    canvas.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas.current === null) return;
    canvasCtx.current = canvas.current.getContext('2d');

    return () => {
      if (canvas.current === null) return;
      canvas.current.removeEventListener('mousemove', handleMove);
      canvas.current.removeEventListener('mouseout', handleOut);
      canvas.current.removeEventListener('mouseup', handleUp);
    };
  }, []);

  function handleDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (canvas.current === null) return;
    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;

    const textPathMaxIndex = textPaths.length - 1;
    const textPathHit = textPaths
      .slice()
      .reverse()
      .some((textPath, i) => {
        // クリックした座標が文字列の枠内か判定
        if (clickPositionX < textPath.offset.x) return false;
        if (clickPositionX > textPath.endPoint.x) return false;
        if (clickPositionY < textPath.endPoint.y) return false;
        if (clickPositionY > textPath.offset.y) return false;

        const someIndex = textPathMaxIndex - i;
        filterTextPaths.current = textPaths.filter((_, filterIndex) => someIndex !== filterIndex);

        const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
        const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
        if (!(pressedMacCommandKey || pressedWinControlKey))
          filterTextPaths.current = filterTextPaths.current.map((textPath) => ({ ...textPath, isSelected: false }));

        hitTextPath.current = textPath;
        hitTextPath.current.isSelected = true;

        setTextPaths([...filterTextPaths.current, hitTextPath.current]);

        return true;
      });

    if (!textPathHit) return setTextPaths(isSelectedReset);

    initialX.current = clickPositionX;
    initialY.current = clickPositionY;

    canvas.current.addEventListener('mousemove', handleMove);
    canvas.current.addEventListener('mouseup', handleUp);
    canvas.current.addEventListener('mouseout', handleOut);
  }

  function handleMove(event: MouseEvent) {
    if (canvas.current === null) return;
    if (hitTextPath.current === undefined) return;

    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.x - Math.floor(rect.x);
    const clickPositionY = event.y - Math.floor(rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    if (isMovableX) {
      hitTextPath.current.offset.x += clickPositionX - initialX.current;
      hitTextPath.current.endPoint.x += clickPositionX - initialX.current;
      initialX.current = clickPositionX;
    }
    if (isMovableY) {
      hitTextPath.current.offset.y += clickPositionY - initialY.current;
      hitTextPath.current.endPoint.y += clickPositionY - initialY.current;
      initialY.current = clickPositionY;
    }
    setTextPaths([...filterTextPaths.current, hitTextPath.current]);
  }

  function handleUp(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mouseout', handleOut);
    canvas.current.removeEventListener('mouseup', handleUp);
  }

  function handleOut(event: MouseEvent) {
    if (canvas.current === null) return;
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mouseup', handleUp);
    canvas.current.removeEventListener('mouseout', handleOut);
  }
  return { canvas, canvasCtx, handleDown };
};
