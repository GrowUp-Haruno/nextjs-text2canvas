import {
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  useState,
  DOMAttributes,
  useReducer,
  MouseEvent,
} from 'react';
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

  type CanvasState = 'initial' | 'searchPath' | 'movePath' | 'dragArea';
  type CanvasProps = {
    state: CanvasState;
    onMouseMove?: DOMAttributes<HTMLCanvasElement>['onMouseLeave'];
    onMouseDown?: DOMAttributes<HTMLCanvasElement>['onMouseDown'];
    onMouseUp?: DOMAttributes<HTMLCanvasElement>['onMouseUp'];
    onMouseOut?: DOMAttributes<HTMLCanvasElement>['onMouseOut'];
  };
  type CanvasPropsList = { [key in CanvasState]: CanvasProps };
  const canvasPropsList: CanvasPropsList = {
    initial: { state: 'initial' },
    searchPath: {
      state: 'searchPath',
      onMouseMove: searchPath_Move,
      onMouseDown: searchPath_Down,
    },
    movePath: {
      state: 'movePath',
      onMouseMove: movePath_Move,
      onMouseUp: movePath_Up,
      onMouseOut: movePath_Out,
    },
    dragArea: {
      state: 'dragArea',
      onMouseMove: () => {
        console.log('dragArea change');
      },
      onMouseUp: dragArea_Up,
      onMouseOut: dragArea_Out,
    },
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

  function searchPath_Move(event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) {
    if (canvas.current === null) return;

    origin.current.x = event.pageX - event.currentTarget.offsetLeft;
    origin.current.y = event.pageY - event.currentTarget.offsetTop;

    hitTextPathIndex.current = -1;
    hitTextPath.current = textPaths
      .slice()
      .reverse()
      .find((textPath, i) => {
        if (canvasCtx.current === null) return false;
        if (textPath.selectedPath2D === undefined) return false;
        const isPointInPath = canvasCtx.current.isPointInPath(
          textPath.selectedPath2D,
          origin.current.x,
          origin.current.y
        );
        if (!isPointInPath) return false;
        hitTextPathIndex.current = textPaths.length - i - 1;
        return true;
      });
  }
  function searchPath_Down(event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) {
    if (hitTextPath.current !== undefined) {
      hitTextPath.current.isSelected = true;
      const unHitTextPaths = textPaths.filter((_, i) => i !== hitTextPathIndex.current);
      const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
      const nowTextPaths = [...newUnHitTextPaths, hitTextPath.current];
      setTextPaths(nowTextPaths);
      dispatchCanvasProps({ state: 'movePath' });
    }

    if (hitTextPath.current === undefined) {
      setTextPaths(isSelectedReset);
      dispatchCanvasProps({ state: 'dragArea' });
    }
  }

  function movePath_Move(event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) {
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
    dispatchCanvasProps({ state: 'searchPath' });
  }
  function movePath_Up() {
    dispatchCanvasProps({ state: 'searchPath' });
  }

  function dragArea_Move(event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) {
    
  }
  function dragArea_Out() {
    dispatchCanvasProps({ state: 'searchPath' });
  }
  function dragArea_Up() {
    dispatchCanvasProps({ state: 'searchPath' });
  }

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
      // canvas.current.addEventListener('mousemove', handleDrag);
      // canvas.current.addEventListener('mouseup', handleUp);
      // canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    if (hitTextPath.isSelected === true) {
      // setSelectedArea(initialTextPath);
      // canvas.current.addEventListener('mousemove', handleMove);
      // canvas.current.addEventListener('mouseup', handleUp);
      // canvas.current.addEventListener('mouseout', handleOut);
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
      // canvas.current.addEventListener('mousemove', handleMove);
      // canvas.current.addEventListener('mouseup', handleUp);
      // canvas.current.addEventListener('mouseout', handleOut);
      return;
    }

    const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
    nowTextPaths = [...newUnHitTextPaths, hitTextPath];
    setTextPaths(nowTextPaths);

    // canvas.current.addEventListener('mousemove', handleMove);
    // canvas.current.addEventListener('mouseup', handleUp);
    // canvas.current.addEventListener('mouseout', handleOut);
  }

  // path範囲選択
  // function handleDrag(event: MouseEvent) {
  //   if (canvas.current === null) return;

  //   const rect = canvas.current.getBoundingClientRect();
  //   const distanceOriginToDrag: Coordinates = {
  //     x: event.x - Math.floor(rect.x) - originX.current,
  //     y: event.y - Math.floor(rect.y) - originY.current,
  //   };
  //   const origin: Coordinates = { x: originX.current, y: originY.current };
  //   const drag: Coordinates = { x: event.x - Math.floor(rect.x), y: event.y - Math.floor(rect.y) };

  //   const draggedArea = getDraggeddArea({ distanceOriginToDrag, origin, drag });
  //   const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
  //   const selectedArea = getNewSelectedArea(newTextPaths);

  //   setDraggeddArea(draggedArea);
  //   setTextPaths(newTextPaths);
  //   setSelectedArea(selectedArea);
  // }

  // function handleUp(event: MouseEvent) {
  //   if (canvas.current === null) return;
  //   setDraggeddArea(initialTextPath);
  //   canvas.current.removeEventListener('mousemove', handleMove);
  //   canvas.current.removeEventListener('mousemove', handleDrag);
  //   canvas.current.removeEventListener('mouseout', handleOut);
  //   canvas.current.removeEventListener('mouseup', handleUp);
  // }

  // function handleOut(event: MouseEvent) {
  //   if (canvas.current === null) return;
  //   setDraggeddArea(initialTextPath);
  //   canvas.current.removeEventListener('mousemove', handleMove);
  //   canvas.current.removeEventListener('mousemove', handleDrag);
  //   canvas.current.removeEventListener('mouseup', handleUp);
  //   canvas.current.removeEventListener('mouseout', handleOut);
  // }

  return { canvasProps, setSelectedArea };
};
