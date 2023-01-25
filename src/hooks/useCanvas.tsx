import { useEffect, useRef, Dispatch, SetStateAction, useState } from 'react';
import { getPath2D } from '../commons/getPath2D';
import { getSelectedPath2D } from '../commons/getSelectedPath2D';
import { initialTextPath } from '../commons/initialTextPath';
import { pathDraw } from '../commons/pathDraw';
import { getDraggeddArea } from '../commons/setDraggeddArea';
import { getNewSelectedArea } from '../commons/setSelectedTextPath';
import { getNewTextPaths, isSelectedReset } from '../commons/setTextPathsFn';
import { TextPath, Coordinates } from '../types/TextPath';
import { EventList, EventListener, useEventListener } from './useEventListener';
import { useSystem } from './useSystem';

type HooksArg = {
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
};

export const useCanvas = ({ textPaths, setTextPaths }: HooksArg) => {
  const [selectedPath, setSelectedPath] = useState(initialTextPath);
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
      textPath: selectedPath,
    });

    pathDraw({
      ctx: canvasCtx.current,
      textPath: draggedArea,
    });
  }, [textPaths, selectedPath, draggedArea]);

  const searchPath_canvas_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    origin.current.x = event.pageX - rect.x;
    origin.current.y = event.pageY - rect.y;

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
  };
  const searchPath_canvas_pointerdown: EventListener<'pointerdown'> = (event) => {
    if (canvas.current === null) return;

    if (hitTextPath.current === undefined) {
      setTextPaths(isSelectedReset);
      setSelectedPath(initialTextPath);
      setEventState('dragArea');
      return;
    }

    if (hitTextPath.current.isSelected === true) {
      canvas.current.style.cursor = 'grabbing';
      setEventState('movePath');
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
      setSelectedPath(getNewSelectedArea([...selectedTextPaths, hitTextPath.current]));
    } else {
      const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
      const nowTextPaths = [...newUnHitTextPaths, hitTextPath.current];
      setTextPaths(nowTextPaths);
      setSelectedPath(getNewSelectedArea(nowTextPaths));
    }
    canvas.current.style.cursor = 'grabbing';
    setEventState('movePath');
  };

  const movePath_page_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;

    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);
    const selectArea = selectedPath.selectedArea;
    const rect = canvas.current.getBoundingClientRect();

    const clickPositionX = event.pageX - rect.x;
    const clickPositionY = event.pageY - rect.y;
    const diffX = clickPositionX - origin.current.x;
    const diffY = clickPositionY - origin.current.y;

    const endX = selectArea.x + selectArea.w;
    const movingX_min = Math.floor(selectArea.x);
    const movingX_max = Math.floor(rect.width - endX);

    const endY = selectArea.y + selectArea.h;
    const movingY_min = Math.floor(selectArea.y);
    const movingY_max = Math.floor(rect.height - endY);

    const testStartX = selectArea.x + diffX < 0;
    const testEndX = endX + diffX > canvas.current.width;
    const textStartY = selectArea.y + diffY < 0;
    const testEndY = endY + diffY > canvas.current.height;

    let movingX = diffX;
    let movingY = diffY;
    if (testStartX) movingX = -movingX_min;
    if (testEndX) movingX = movingX_max;
    if (textStartY) movingY = -movingY_min;
    if (testEndY) movingY = movingY_max;

    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;
    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX) {
        selectedTextPath.offset.x += movingX;
        selectedTextPath.selectedArea.x += movingX;
        selectedTextPath.selectedArea.centerX += movingX;
      }
      if (isMovableY) {
        selectedTextPath.offset.y += movingY;
        selectedTextPath.selectedArea.y += movingY;
        selectedTextPath.selectedArea.centerY += movingY;
      }

      selectedTextPath.path2D = getPath2D(selectedTextPath);
      selectedTextPath.selectedPath2D = getSelectedPath2D({ textPath: selectedTextPath });

      return selectedTextPath;
    });

    if (isMovableX) origin.current.x = clickPositionX;
    if (isMovableY) origin.current.y = clickPositionY;

    setTextPaths([...unSelectedTextPaths, ...newSelectedPaths]);
    setSelectedPath(getNewSelectedArea(newSelectedPaths));
  };
  const movePath_page_pointerup: EventListener<'pointerup'> = () => {
    canvas.current!.style.cursor = 'grab';
    setEventState('searchPath');
  };

  const dragArea_page_pointermove_AreaUpdate: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    const drag: Coordinates = {
      x: event.pageX - rect.x,
      y: event.pageY - rect.y,
    };
    const distanceOriginToDrag: Coordinates = {
      x: drag.x - origin.current.x,
      y: drag.y - origin.current.y,
    };

    const draggedArea = getDraggeddArea({ distanceOriginToDrag, origin: origin.current, drag });
    setDraggeddArea(draggedArea);
  };
  const dragArea_page_pointermove_HitTest: EventListener<'pointermove'> = (event) => {
    const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
    const selectedPath = getNewSelectedArea(newTextPaths);
    setTextPaths(newTextPaths);
    setSelectedPath(selectedPath);
  };
  const dragArea_page_pointerup: EventListener<'pointerup'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    origin.current.x = event.pageX - rect.x;
    origin.current.y = event.pageY - rect.y;
    setDraggeddArea(initialTextPath);
    setEventState('searchPath');
  };

  // イベントリスナ管理
  type EventState = 'searchPath' | 'movePath' | 'dragArea';
  type ElementId = 'canvas' | 'page';
  const eventList: EventList<EventState, ElementId> = {
    searchPath: {
      canvas: {
        pointermove: [searchPath_canvas_pointermove],
        pointerdown: [searchPath_canvas_pointerdown],
      },
    },
    movePath: {
      page: {
        pointermove: [movePath_page_pointermove],
        pointerup: [movePath_page_pointerup],
      },
    },
    dragArea: {
      page: {
        pointermove: [dragArea_page_pointermove_AreaUpdate, dragArea_page_pointermove_HitTest],
        pointerup: [dragArea_page_pointerup],
      },
    },
  };
  const [eventState, setEventState] = useState<EventState>('searchPath');
  useEventListener(eventList, eventState, [textPaths, eventState]);
  return { setSelectedPath };
};
