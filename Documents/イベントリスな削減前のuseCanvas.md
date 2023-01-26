```ts
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
      setSelectedArea(initialTextPath);
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
      setSelectedArea(getNewSelectedArea([...selectedTextPaths, hitTextPath.current]));
    } else {
      const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
      const nowTextPaths = [...newUnHitTextPaths, hitTextPath.current];
      setTextPaths(nowTextPaths);
    }
    canvas.current.style.cursor = 'grabbing';
    setEventState('movePath');
  };

  const movePath_canvas_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;

    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);
    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.pageX - rect.x;
    const clickPositionY = event.pageY - rect.y;
    const movingX = clickPositionX - origin.current.x;
    const movingY = clickPositionY - origin.current.y;
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    const selectedPath = getNewSelectedArea(selectedTextPaths);
    const startX = selectedPath.selectedArea.x;
    const startY = selectedPath.selectedArea.y;
    const testStartX = startX + movingX < 0;
    const textStartY = startY + movingY < 0;

    const endX = startX + selectedPath.selectedArea.w;
    const endY = startY + selectedPath.selectedArea.h;
    const testEndX = endX + movingX > canvas.current.width;
    const testEndY = endY + movingY > canvas.current.height;

    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX && !testStartX && !testEndX) {
        selectedTextPath.offset.x += movingX;
        selectedTextPath.selectedArea.x += movingX;
        selectedTextPath.selectedArea.centerX += movingX;
      }
      if (isMovableY && !textStartY && !testEndY) {
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
    setSelectedArea(getNewSelectedArea(newSelectedPaths));
  };
  const movePath_canvas_pointerout: EventListener<'pointerout'> = () => {
    canvas.current!.style.cursor = 'crosshair';
    document.getElementById('page')!.style.cursor = 'grabbing';
    setEventState('movePathOut');
  };
  const movePath_canvas_pointerup: EventListener<'pointerup'> = () => {
    canvas.current!.style.cursor = 'grab';
    setEventState('searchPath');
  };

  const movePathOut_canvas_pointerover: EventListener<'pointerover'> = (event) => {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      canvas.current.style.cursor = 'grabbing';
      setEventState('movePath');
    } else {
      setEventState('searchPath');
    }
  };
  const movePathOut_page_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;

    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);
    const rect = canvas.current.getBoundingClientRect();
    const clickPositionX = event.pageX - rect.x;
    const clickPositionY = event.pageY - rect.y;
    const movingX = clickPositionX - origin.current.x;
    const movingY = clickPositionY - origin.current.y;
    const isMovableX = !event.shiftKey || event.altKey;
    const isMovableY = !event.shiftKey || !event.altKey;

    const selectedPath = getNewSelectedArea(selectedTextPaths);
    const startX = selectedPath.selectedArea.x;
    const startY = selectedPath.selectedArea.y;
    const testStartX = startX + movingX < 0;
    const textStartY = startY + movingY < 0;

    const endX = startX + selectedPath.selectedArea.w;
    const endY = startY + selectedPath.selectedArea.h;
    const testEndX = endX + movingX > canvas.current.width;
    const testEndY = endY + movingY > canvas.current.height;

    const newSelectedPaths = selectedTextPaths.map((selectedTextPath) => {
      if (isMovableX && !testStartX && !testEndX) {
        selectedTextPath.offset.x += movingX;
        selectedTextPath.selectedArea.x += movingX;
        selectedTextPath.selectedArea.centerX += movingX;
      }
      if (isMovableY && !textStartY && !testEndY) {
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
    setSelectedArea(getNewSelectedArea(newSelectedPaths));
  };
  const movePathOut_page_pointerup: EventListener<'pointerup'> = () => {
    canvas.current!.style.cursor = 'crosshair';
    document.getElementById('page')!.style.cursor = '';
    setEventState('searchPath');
  };

  const dragArea_canvas_pointermove_AreaUpdate: EventListener<'pointermove'> = (event) => {
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
  const dragArea_canvas_pointermove_HitTest: EventListener<'pointermove'> = (event) => {
    const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
    const selectedArea = getNewSelectedArea(newTextPaths);
    setTextPaths(newTextPaths);
    setSelectedArea(selectedArea);
  };
  const dragArea_canvas_pointerout: EventListener<'pointerout'> = () => {
    setEventState('dragAreaOut');
  };
  const dragArea_canvas_pointerup: EventListener<'pointerup'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    origin.current.x = event.pageX - rect.x;
    origin.current.y = event.pageY - rect.y;
    setDraggeddArea(initialTextPath);
    setEventState('searchPath');
  };

  const dragAreaOut_page_pointermove_AreaUpdate: EventListener<'pointermove'> = (event) => {
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
  const dragAreaOut_page_pointermove_HitTest: EventListener<'pointermove'> = (event) => {
    const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
    const selectedArea = getNewSelectedArea(newTextPaths);
    setTextPaths(newTextPaths);
    setSelectedArea(selectedArea);
  };
  const dragAreaOut_page_pointerup: EventListener<'pointerup'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    origin.current.x = event.pageX - rect.x;
    origin.current.y = event.pageY - rect.y;
    setDraggeddArea(initialTextPath);
    setEventState('searchPath');
  };
  const dragAreaOut_canvas_pointerover: EventListener<'pointerover'> = (event) => {
    if (canvas.current === null) return;
    if (event.buttons === 1) {
      setEventState('dragArea');
    } else {
      setDraggeddArea(initialTextPath);
      setEventState('searchPath');
    }
  };

  // イベントリスナ管理
  type EventState = 'searchPath' | 'movePath' | 'dragArea' | 'movePathOut' | 'dragAreaOut';
  type ElementId = 'canvas' | 'page';
  const eventList: EventList<EventState, ElementId> = {
    searchPath: {
      canvas: {
        pointermove: [searchPath_canvas_pointermove],
        pointerdown: [searchPath_canvas_pointerdown],
      },
    },
    movePath: {
      canvas: {
        pointermove: [movePath_canvas_pointermove],
        pointerup: [movePath_canvas_pointerup],
        pointerout: [movePath_canvas_pointerout],
      },
    },
    dragArea: {
      canvas: {
        pointermove: [dragArea_canvas_pointermove_AreaUpdate, dragArea_canvas_pointermove_HitTest],
        pointerup: [dragArea_canvas_pointerup],
        pointerout: [dragArea_canvas_pointerout],
      },
    },
    movePathOut: {
      canvas: { pointerover: [movePathOut_canvas_pointerover] },
      page: {
        pointermove: [movePathOut_page_pointermove],
        pointerup: [movePathOut_page_pointerup],
      },
    },
    dragAreaOut: {
      canvas: { pointerover: [dragAreaOut_canvas_pointerover] },
      page: {
        pointermove: [dragAreaOut_page_pointermove_AreaUpdate, dragAreaOut_page_pointermove_HitTest],
        pointerup: [dragAreaOut_page_pointerup],
      },
    },
  };
  const [eventState, setEventState] = useState<EventState>('searchPath');
  useEventListener(eventList, eventState, [textPaths, eventState]);
  return { setSelectedArea };
};
```
