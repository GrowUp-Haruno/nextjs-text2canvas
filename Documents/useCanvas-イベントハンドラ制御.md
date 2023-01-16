# useCanvas-イベントハンドラ制御

```tsx
import { useEffect, useRef, Dispatch, SetStateAction, useState, DOMAttributes, useReducer, PointerEvent } from 'react';
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

  type CanvasState = 'initial' | 'searchPath' | 'movePath' | 'dragArea' | 'movePathOut' | 'dragAreaOut';
  type CanvasProps = {
    state: CanvasState;
    onPointerMove?: DOMAttributes<HTMLCanvasElement>['onPointerLeave'];
    onPointerDown?: DOMAttributes<HTMLCanvasElement>['onPointerDown'];
    onPointerUp?: DOMAttributes<HTMLCanvasElement>['onPointerUp'];
    onPointerOut?: DOMAttributes<HTMLCanvasElement>['onPointerOut'];
    onPointerOver?: DOMAttributes<HTMLCanvasElement>['onPointerOver'];
  };
  type CanvasPropsList = { [key in CanvasState]: CanvasProps };
  const canvasPropsList: CanvasPropsList = {
    initial: { state: 'initial' },
    searchPath: {
      state: 'searchPath',
      onPointerMove: searchPath_Move,
      onPointerDown: searchPath_Down,
    },
    movePath: {
      state: 'movePath',
      onPointerMove: movePath_Move,
      onPointerUp: movePath_Up,
      onPointerOut: movePath_Out,
    },
    dragArea: {
      state: 'dragArea',
      onPointerMove: dragArea_Move,
      onPointerUp: dragArea_Up,
      onPointerOut: dragArea_Out,
    },
    movePathOut: { state: 'movePathOut', onPointerOver: mouvePathOver_Over },
    dragAreaOut: { state: 'dragAreaOut', onPointerOver: dragAreaOut_Over },
  };
  const canvasReducer = (_: CanvasProps, action: { state: CanvasState }) => {
    return canvasPropsList[action.state];
  };
  const [canvasProps, dispatchCanvasProps] = useReducer(canvasReducer, canvasPropsList['initial']);
  useEffect(() => {
    if (canvas.current === null) return;
    if (canvasCtx.current === null) return;
    if (canvasProps.state === 'dragArea') return;
    if (canvasProps.state === 'movePath') return;

    if (canvasProps.state === 'initial') dispatchCanvasProps({ state: 'searchPath' });
    if (canvasProps.state === 'searchPath') dispatchCanvasProps({ state: 'searchPath' });
  }, [textPaths]);

  function searchPath_Move(event: PointerEvent<HTMLCanvasElement>) {
    if (canvas.current === null) return;

    origin.current.x = event.pageX - event.currentTarget.offsetLeft;
    origin.current.y = event.pageY - event.currentTarget.offsetTop;

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
  function searchPath_Down(event: PointerEvent<HTMLCanvasElement>) {
    if (canvas.current === null) return;

    if (hitTextPath.current === undefined) {
      setTextPaths(isSelectedReset);
      setSelectedArea(initialTextPath);
      dispatchCanvasProps({ state: 'dragArea' });
      return;
    }

    if (hitTextPath.current.isSelected === true) {
      canvas.current.style.cursor = 'grabbing';
      dispatchCanvasProps({ state: 'movePath' });
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
    dispatchCanvasProps({ state: 'movePath' });
  }

  function movePath_Move(event: PointerEvent<HTMLCanvasElement>) {
    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);

    const clickPositionX = event.pageX - event.currentTarget.offsetLeft;
    const clickPositionY = event.pageY - event.currentTarget.offsetTop;
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
    dispatchCanvasProps({ state: 'movePathOut' });
  }
  function movePath_Up() {
    if (canvas.current !== null) canvas.current.style.cursor = 'grab';
    dispatchCanvasProps({ state: 'searchPath' });
  }

  function dragArea_Move(event: PointerEvent<HTMLCanvasElement>) {
    const drag: Coordinates = {
      x: event.pageX - event.currentTarget.offsetLeft,
      y: event.pageY - event.currentTarget.offsetTop,
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
    dispatchCanvasProps({ state: 'dragAreaOut' });
  }
  function dragArea_Up() {
    setDraggeddArea(initialTextPath);
    dispatchCanvasProps({ state: 'searchPath' });
  }

  function mouvePathOver_Over(event: PointerEvent<HTMLCanvasElement>) {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      canvas.current.style.cursor = 'grabbing';
      dispatchCanvasProps({ state: 'movePath' });
    } else {
      dispatchCanvasProps({ state: 'searchPath' });
    }
  }
  function dragAreaOut_Over(event: PointerEvent<HTMLCanvasElement>) {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      dispatchCanvasProps({ state: 'dragArea' });
    } else {
      setDraggeddArea(initialTextPath);
      dispatchCanvasProps({ state: 'searchPath' });
    }
  }

  return { canvasProps, setSelectedArea };
};
```
