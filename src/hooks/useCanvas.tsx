import { useEffect, useRef, Dispatch, SetStateAction, useState } from 'react';
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

type canvasEventKey = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerout' | 'pointerover';
type CanvasEvent = (event: globalThis.PointerEvent) => any;
type CanvasEvents = {
  [key in canvasEventKey]?: CanvasEvent;
};

type CanvasState = 'searchPath' | 'movePath' | 'dragArea' | 'movePathOut' | 'dragAreaOut';
type CanvasEventsList = { [key in CanvasState]: CanvasEvents };

export const useCanvas = ({ textPaths, setTextPaths }: HooksArg) => {
  const [selectedArea, setSelectedArea] = useState(initialTextPath);
  const [draggedArea, setDraggeddArea] = useState(initialTextPath);
  const { system } = useSystem();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const origin = useRef<Coordinates>({ x: 0, y: 0 });
  const hitTextPath = useRef<TextPath | undefined>(undefined);
  const hitTextPathIndex = useRef<number>(-1);

  // canvas初期設定
  useEffect(() => {
    canvas.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas.current === null) return;
    canvasCtx.current = canvas.current.getContext('2d');
  }, []);

  // 描画処理
  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (textPaths === null) return;

    canvasCtx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

    textPaths.forEach((textPath) => {
      if (canvasCtx.current === null) return;
      pathDraw({
        ctx: canvasCtx.current,
        textPath,
      });
    });

    pathDraw({
      ctx: canvasCtx.current,
      textPath: selectedArea,
    });

    pathDraw({
      ctx: canvasCtx.current,
      textPath: draggedArea,
    });
  }, [textPaths, selectedArea, draggedArea]);

  const canvasEventList: CanvasEventsList = {
    searchPath: {
      pointermove: searchPath_Move,
      pointerdown: searchPath_Down,
    },
    movePath: {
      pointermove: movePath_Move,
      pointerup: movePath_Up,
      pointerout: movePath_Out,
    },
    dragArea: {
      pointermove: dragArea_Move,
      pointerup: dragArea_Up,
      pointerout: dragArea_Out,
    },
    movePathOut: { pointerover: mouvePathOver_Over },
    dragAreaOut: { pointerover: dragAreaOut_Over },
  };

  const [canvasState, setCanvasState] = useState<CanvasState>('searchPath');

  useEffect(() => {
    const addEvents = Object.entries(canvasEventList[canvasState]) as [canvasEventKey, CanvasEvent][];
    addEvents.forEach(([key, value]) => {
      canvas.current?.addEventListener(key, value, false);
    });

    return () => {
      const removeEvents = Object.entries(canvasEventList[canvasState]) as [canvasEventKey, CanvasEvent][];
      removeEvents.forEach(([key, value]) => {
        canvas.current?.removeEventListener(key, value, false);
      });
    };
  }, [textPaths, canvasState]);

  function searchPath_Move(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();

    origin.current.x = Math.floor(event.pageX - rect.x);
    origin.current.y = Math.floor(event.pageY - rect.y);

    hitTextPathIndex.current = -1;
    hitTextPath.current = textPaths
      .slice()
      .reverse()
      .find((textPath, i) => {
        if (canvasCtx.current === null) return false;
        if (textPath.path2D === undefined) return false;
        if (textPath.selectedPath2D === undefined) return false;

        const testPath = textPath.isSelected === true ? textPath.selectedPath2D : textPath.path2D;
        const isPointInPath = canvasCtx.current.isPointInPath(testPath, origin.current.x, origin.current.y);
        if (!isPointInPath) return false;

        hitTextPathIndex.current = textPaths.length - i - 1;
        return true;
      });

    if (hitTextPath.current === undefined) canvas.current.style.cursor = 'crosshair';
    else canvas.current.style.cursor = 'grab';
  }
  function searchPath_Down(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;

    if (hitTextPath.current === undefined) {
      setTextPaths(isSelectedReset);
      setSelectedArea(initialTextPath);
      setCanvasState('dragArea');
      return;
    }

    if (hitTextPath.current.isSelected === true) {
      canvas.current.style.cursor = 'grabbing';
      setCanvasState('movePath');
      return;
    }

    hitTextPath.current.isSelected = true;
    const unHitTextPaths = textPaths.filter((_, i) => i !== hitTextPathIndex.current);

    // ctrlキーによる複数選択
    const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
    const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
    if (pressedMacCommandKey || pressedWinControlKey) {
      const selectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === true);
      const unSelectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === false);
      setTextPaths([...unSelectedTextPaths, ...selectedTextPaths, hitTextPath.current]);
      setSelectedArea(getNewSelectedArea([...selectedTextPaths, hitTextPath.current]));
    } else {
      const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
      const nowTextPaths = [...newUnHitTextPaths, hitTextPath.current];
      setTextPaths(nowTextPaths);
    }
    canvas.current.style.cursor = 'grabbing';
    setCanvasState('movePath');
  }

  function movePath_Move(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;

    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);
    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = Math.floor(event.pageX - rect.x);
    const clickPositionY = Math.floor(event.pageY - rect.y);
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX) {
        selectedTextPath.offset.x += clickPositionX - origin.current.x;
        selectedTextPath.endPoint.x += clickPositionX - origin.current.x;
      }
      if (isMovableY) {
        selectedTextPath.offset.y += clickPositionY - origin.current.y;
        selectedTextPath.endPoint.y += clickPositionY - origin.current.y;
      }

      selectedTextPath.path2D = getPath2D(selectedTextPath);
      selectedTextPath.selectedPath2D = getSelectedPath2D({ textPath: selectedTextPath });

      return selectedTextPath;
    });

    if (isMovableX) origin.current.x = clickPositionX;
    if (isMovableY) origin.current.y = clickPositionY;

    setTextPaths([...unSelectedTextPaths, ...newSelectedPaths]);
    setSelectedArea(getNewSelectedArea(newSelectedPaths));
  }
  function movePath_Out() {
    if (canvas.current !== null) canvas.current.style.cursor = 'crosshair';
    setCanvasState('movePathOut');
  }
  function movePath_Up() {
    if (canvas.current !== null) canvas.current.style.cursor = 'grab';
    setCanvasState('searchPath');
  }

  function dragArea_Move(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    const drag: Coordinates = {
      x: Math.floor(event.pageX - rect.x),
      y: Math.floor(event.pageY - rect.y),
    };
    const distanceOriginToDrag: Coordinates = {
      x: drag.x - origin.current.x,
      y: drag.y - origin.current.y,
    };

    const draggedArea = getDraggeddArea({ distanceOriginToDrag, origin: origin.current, drag });
    const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
    const selectedArea = getNewSelectedArea(newTextPaths);

    setDraggeddArea(draggedArea);
    setTextPaths(newTextPaths);
    setSelectedArea(selectedArea);
  }
  function dragArea_Out() {
    setCanvasState('dragAreaOut');
  }
  function dragArea_Up() {
    setDraggeddArea(initialTextPath);
    setCanvasState('searchPath');
  }

  function mouvePathOver_Over(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      canvas.current.style.cursor = 'grabbing';
      setCanvasState('movePath');
    } else {
      setCanvasState('searchPath');
    }
  }
  function dragAreaOut_Over(event: globalThis.PointerEvent) {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      setCanvasState('dragArea');
    } else {
      setDraggeddArea(initialTextPath);
      setCanvasState('searchPath');
    }
  }

  return { setSelectedArea };
};
