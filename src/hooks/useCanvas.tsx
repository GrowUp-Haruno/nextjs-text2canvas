import { useEffect, useRef, Dispatch, SetStateAction, MutableRefObject, useState } from 'react';
import { getPath2D } from '../commons/getPath2D';
import { getSelectedPath2D } from '../commons/getSelectedPath2D';
import { initialTextPath } from '../commons/initialTextPath';
import { pathDraw } from '../commons/pathDraw';
import { getDraggeddArea } from '../commons/setDraggeddArea';
import { getNewSelectedArea } from '../commons/setSelectedTextPath';
import { getNewTextPaths, isSelectedReset } from '../commons/setTextPathsFn';
import { TextPath, Coordinates } from '../types/TextPath';
import { useSystem } from './useSystem';

type HooksArg = {
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
};

export const useCanvas = ({ textPaths, setTextPaths }: HooksArg) => {
  const [selectedArea, setSelectedArea] = useState(initialTextPath);
  const [draggedArea, setDraggeddArea] = useState(initialTextPath);
  const { system } = useSystem();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  let nowTextPaths: TextPath[] = [];
  const originX = useRef(0);
  const originY = useRef(0);

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

  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (textPaths === null) return;

    canvasCtx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

    textPaths.forEach((textPath, i) => {
      if (canvasCtx.current === null) return;
      pathDraw({
        ctx: canvasCtx.current,
        textPath,
      });
    });

    // pathDraw({
    //   ctx: canvasCtx.current,
    //   textPath: selectedArea,
    // });

    // pathDraw({
    //   ctx: canvasCtx.current,
    //   textPath: draggedArea,
    //   padding: 0,
    // });
  }, [
    textPaths,
    selectedArea,
    // draggedArea
  ]);

  // path単体選択
  function handleDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (canvas.current === null) return;
    nowTextPaths = textPaths;
    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;
    originX.current = clickPositionX;
    originY.current = clickPositionY;

    let hitIndex = -1;
    const hitTextPath = textPaths
      .slice()
      .reverse()
      .find((textPath, i) => {
        // if (clickPositionX < textPath.offset.x) return false;
        // if (clickPositionX > textPath.endPoint.x) return false;
        // if (clickPositionY < textPath.endPoint.y) return false;
        // if (clickPositionY > textPath.offset.y) return false;
        if (canvasCtx.current === null) return false;
        if (textPath.selectedPath2D === undefined) return false;
        const isPointInPath = canvasCtx.current.isPointInPath(textPath.selectedPath2D, clickPositionX, clickPositionY);
        if (!isPointInPath) return false;

        hitIndex = textPaths.length - i - 1;
        return true;
      });

    if (hitTextPath === undefined) {
      setTextPaths(isSelectedReset);
      setSelectedArea(initialTextPath);
      canvas.current.addEventListener('mousemove', handleDrag);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    if (hitTextPath.isSelected === true) {
      // setSelectedArea(initialTextPath);
      canvas.current.addEventListener('mousemove', handleMove);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    hitTextPath.isSelected = true;
    const unHitTextPaths = textPaths.filter((_, i) => i !== hitIndex);

    // ctrlキーによる複数選択
    const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
    const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
    if (pressedMacCommandKey || pressedWinControlKey) {
      const selectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === true);
      const unSelectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === false);
      nowTextPaths = [...unSelectedTextPaths, ...selectedTextPaths, hitTextPath];
      setTextPaths(nowTextPaths);
      setSelectedArea(getNewSelectedArea([...selectedTextPaths, hitTextPath]));
      canvas.current.addEventListener('mousemove', handleMove);
      canvas.current.addEventListener('mouseup', handleUp);
      canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
    nowTextPaths = [...newUnHitTextPaths, hitTextPath];
    setTextPaths(nowTextPaths);

    canvas.current.addEventListener('mousemove', handleMove);
    canvas.current.addEventListener('mouseup', handleUp);
    canvas.current.addEventListener('mouseout', handleOut);
  }

  // path範囲選択
  function handleDrag(event: MouseEvent) {
    if (canvas.current === null) return;

    const rect = canvas.current.getBoundingClientRect();
    const distanceOriginToDrag: Coordinates = {
      x: event.x - Math.floor(rect.x) - originX.current,
      y: event.y - Math.floor(rect.y) - originY.current,
    };
    const origin: Coordinates = { x: originX.current, y: originY.current };
    const drag: Coordinates = { x: event.x - Math.floor(rect.x), y: event.y - Math.floor(rect.y) };

    const newTextPaths = getNewTextPaths({ distanceOriginToDrag, origin, textPaths });
    setTextPaths(newTextPaths);
    setSelectedArea(getNewSelectedArea(newTextPaths));
    setDraggeddArea(getDraggeddArea({ distanceOriginToDrag, origin, drag }));
  }

  // path移動
  function handleMove(event: MouseEvent) {
    if (canvas.current === null) return;

    const selectedTextPaths = nowTextPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = nowTextPaths.filter((textPath) => textPath.isSelected === false);

    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.x - Math.floor(rect.x);
    const clickPositionY = event.y - Math.floor(rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX) {
        selectedTextPath.offset.x += clickPositionX - originX.current;
        selectedTextPath.endPoint.x += clickPositionX - originX.current;
      }
      if (isMovableY) {
        selectedTextPath.offset.y += clickPositionY - originY.current;
        selectedTextPath.endPoint.y += clickPositionY - originY.current;
      }

      selectedTextPath.path2D = getPath2D(selectedTextPath);
      selectedTextPath.selectedPath2D = getSelectedPath2D({ textPath: selectedTextPath });

      return selectedTextPath;
    });

    if (isMovableX) originX.current = clickPositionX;
    if (isMovableY) originY.current = clickPositionY;

    setTextPaths([...unSelectedTextPaths, ...newSelectedPaths]);
    setSelectedArea(getNewSelectedArea(newSelectedPaths));
  }

  function handleUp(event: MouseEvent) {
    if (canvas.current === null) return;
    setDraggeddArea(initialTextPath);
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mousemove', handleDrag);
    canvas.current.removeEventListener('mouseout', handleOut);
    canvas.current.removeEventListener('mouseup', handleUp);
  }

  function handleOut(event: MouseEvent) {
    if (canvas.current === null) return;
    setDraggeddArea(initialTextPath);
    canvas.current.removeEventListener('mousemove', handleMove);
    canvas.current.removeEventListener('mousemove', handleDrag);
    canvas.current.removeEventListener('mouseup', handleUp);
    canvas.current.removeEventListener('mouseout', handleOut);
  }

  return { handleDown, setSelectedArea };
};
