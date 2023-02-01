import { useEffect, useRef, Dispatch, SetStateAction, useState, LegacyRef } from 'react';
import { getPath2D } from '../../commons/getPath2D';
import { getSelectedPath2D } from '../../commons/getSelectedPath2D';
import { initialTextPath } from '../../commons/initialTextPath';
import { pathDraw } from '../../commons/pathDraw';
import { getDraggeddArea } from '../../commons/setDraggeddArea';
import { getNewSelectedArea } from '../../commons/setSelectedTextPath';
import { getNewTextPaths, isSelectedDelete, isSelectedReset } from '../../commons/setTextPathsFn';
import { TextPath, Coordinates, SelectedArea, PathClickPosition } from '../../types/TextPath';
import { EventList, EventListener, useEventListener } from '../../hooks/useEventListener';
import { useSystem } from '../../hooks/useSystem';
import { ToolId } from '../ToolPalettes/useToolpalettes';

type HooksArg = {
  textPaths: TextPath[];
  setTextPaths: Dispatch<SetStateAction<TextPath[]>>;
  selectedTool: ToolId;
};

export const useCanvas = ({ textPaths, setTextPaths, selectedTool }: HooksArg) => {
  const [selectedPath, setSelectedPath] = useState(initialTextPath);
  const [draggedArea, setDraggeddArea] = useState(initialTextPath);
  const { system } = useSystem();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const origin = useRef<Coordinates>({ x: 0, y: 0 });
  const hitTextPath = useRef<TextPath | undefined>(undefined);
  const hitTextPathIndex = useRef<number>(-1);
  const hasHoversSelectedPath = useRef<boolean>(false);
  const selectedPathClickPosition = useRef<PathClickPosition>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const lastTiem = useRef<{
    hasOver: {
      x: boolean;
      y: boolean;
    };
    hasUnder: {
      x: boolean;
      y: boolean;
    };
  }>({ hasOver: { x: false, y: false }, hasUnder: { x: false, y: false } });

  function setClickSelectedArea(selectedArea: SelectedArea) {
    selectedPathClickPosition.current = {
      left: origin.current.x - selectedArea.x,
      right: selectedArea.x + selectedArea.w - origin.current.x,
      top: origin.current.y - selectedArea.y,
      bottom: selectedArea.y + selectedArea.h - origin.current.y,
    };
  }
  function resetClickSelectedArea() {
    selectedPathClickPosition.current = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
  }

  const canvasResize = () => {
    if (canvas.current === null) return;
    canvas.current.width = canvas.current.clientWidth;
    canvas.current.height = canvas.current.clientHeight;
    setTextPaths((prev) => [...prev]);
  };
  const disabledContextMenu: EventListener<'contextmenu'> = (event) => {
    event.preventDefault();
  };

  // canvas初期設定
  useEffect(() => {
    canvas.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas.current === null) return;
    canvasCtx.current = canvas.current.getContext('2d');
    canvasResize();

    window.addEventListener('resize', canvasResize);
    window.addEventListener('contextmenu', disabledContextMenu);
    return () => {
      window.removeEventListener('resize', canvasResize);
      window.removeEventListener('contextmenu', disabledContextMenu);
    };
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

    hasHoversSelectedPath.current = (() => {
      if (canvasCtx.current === null) return false;
      if (selectedPath.selectedPath2D === undefined) return false;

      const testPath = selectedPath.selectedPath2D;
      const isPointInPath = canvasCtx.current.isPointInPath(testPath, origin.current.x, origin.current.y);
      return isPointInPath;
    })();

    if (hitTextPath.current === undefined && hasHoversSelectedPath.current === false)
      canvas.current.style.cursor = 'crosshair';
    else canvas.current.style.cursor = 'grab';
  };
  const searchPath_canvas_pointerdown: EventListener<'pointerdown'> = (event) => {
    if (canvas.current === null) return;

    if (hitTextPath.current === undefined) {
      if (hasHoversSelectedPath.current === true) {
        canvas.current.style.cursor = 'grabbing';
        setClickSelectedArea(selectedPath.selectedArea);
        setEventState('movePath');
      } else {
        resetClickSelectedArea();
        setTextPaths(isSelectedReset);
        setSelectedPath(initialTextPath);
        setEventState('dragArea');
      }
      return;
    }

    if (hitTextPath.current.isSelected === true) {
      canvas.current.style.cursor = 'grabbing';
      setClickSelectedArea(selectedPath.selectedArea);
      setEventState('movePath');
      return;
    }

    hitTextPath.current.isSelected = true;
    const unHitTextPaths = textPaths.filter((_, i) => i !== hitTextPathIndex.current);
    const pressedMacCommandKey: boolean = event.metaKey && system.current.os === 'mac';
    const pressedWinControlKey: boolean = event.ctrlKey && system.current.os === 'windows';
    const { newTextPaths, newSelectedPath } = (() => {
      if (pressedMacCommandKey || pressedWinControlKey) {
        const selectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === true);
        const unSelectedTextPaths = unHitTextPaths.filter((unHitTextPath) => unHitTextPath.isSelected === false);
        const newTextPaths = [...unSelectedTextPaths, ...selectedTextPaths, hitTextPath.current];
        const newSelectedPath = getNewSelectedArea([...selectedTextPaths, hitTextPath.current]);
        return { newTextPaths, newSelectedPath };
      } else {
        const newUnHitTextPaths = unHitTextPaths.map((unHitTextPath) => ({ ...unHitTextPath, isSelected: false }));
        const newTextPaths = [...newUnHitTextPaths, hitTextPath.current];
        const newSelectedPath = getNewSelectedArea(newTextPaths);
        return { newTextPaths, newSelectedPath };
      }
    })();

    canvas.current.style.cursor = 'grabbing';
    setClickSelectedArea(newSelectedPath.selectedArea);
    setTextPaths(newTextPaths);
    setSelectedPath(newSelectedPath);
    setEventState('movePath');
  };
  const searchPath_document_keyup: EventListener<'keyup'> = (event) => {
    if (event.key === 'Escape') {
      setTextPaths(isSelectedReset);
      setSelectedPath(initialTextPath);
    }
    if (event.key === 'Delete') {
      setTextPaths(isSelectedDelete);
      setSelectedPath(initialTextPath);
    }
  };

  const movePath_document_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;

    const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
    const unSelectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === false);
    const rect = canvas.current.getBoundingClientRect();

    const offsetCanvas = {
      right: rect.width - selectedPathClickPosition.current.right,
      left: selectedPathClickPosition.current.left,
      top: selectedPathClickPosition.current.top,
      bottom: rect.height - selectedPathClickPosition.current.bottom,
    };
    const clickPositionX = event.pageX - rect.x;
    const clickPositionY = event.pageY - rect.y;
    const hasOver: { x: boolean; y: boolean } = {
      x: clickPositionX > rect.width - selectedPathClickPosition.current.right,
      y: clickPositionY > rect.height - selectedPathClickPosition.current.bottom,
    };
    const hasUnder: { x: boolean; y: boolean } = {
      x: clickPositionX < selectedPathClickPosition.current.left,
      y: clickPositionY < selectedPathClickPosition.current.top,
    };

    const endX = selectedPath.selectedArea.x + selectedPath.selectedArea.w;
    const endY = selectedPath.selectedArea.y + selectedPath.selectedArea.h;

    let movingX = clickPositionX - origin.current.x;
    let movingY = clickPositionY - origin.current.y;
    if (hasUnder.x) movingX = -Math.floor(selectedPath.selectedArea.x);
    if (hasOver.x) movingX = Math.floor(rect.width - endX);
    if (hasUnder.y) movingY = -Math.floor(selectedPath.selectedArea.y);
    if (hasOver.y) movingY = Math.floor(rect.height - endY);
    if (lastTiem.current.hasOver.x === true && hasOver.x === false) movingX = clickPositionX - offsetCanvas.right;
    if (lastTiem.current.hasOver.y === true && hasOver.y === false) movingY = clickPositionY - offsetCanvas.bottom;
    if (lastTiem.current.hasUnder.x === true && hasUnder.x === false) movingX = clickPositionX - offsetCanvas.left;
    if (lastTiem.current.hasUnder.y === true && hasUnder.y === false) movingY = clickPositionY - offsetCanvas.top;

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

    lastTiem.current = { hasOver, hasUnder };
    setTextPaths([...unSelectedTextPaths, ...newSelectedPaths]);
    setSelectedPath(getNewSelectedArea(newSelectedPaths));
  };
  const movePath_document_pointerup: EventListener<'pointerup'> = () => {
    canvas.current!.style.cursor = 'grab';
    setEventState('searchPath');
  };

  const dragArea_document_pointermove_AreaUpdate: EventListener<'pointermove'> = (event) => {
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
  const dragArea_document_pointermove_HitTest: EventListener<'pointermove'> = () => {
    const newTextPaths = getNewTextPaths({ draggedArea, textPaths });
    const selectedPath = getNewSelectedArea(newTextPaths);
    setTextPaths(newTextPaths);
    setSelectedPath(selectedPath);
  };
  const dragArea_document_pointerup: EventListener<'pointerup'> = (event) => {
    if (canvas.current === null) return;
    const rect = canvas.current.getBoundingClientRect();
    origin.current.x = event.pageX - rect.x;
    origin.current.y = event.pageY - rect.y;
    setDraggeddArea(initialTextPath);
    setEventState('searchPath');
  };

  const text2path_canvas_pointermove: EventListener<'pointermove'> = (event) => {
    if (canvas.current === null) return;
    canvas.current.style.cursor = 'text';
  };
  const text2path_canvas_click: EventListener<'click'> = (event) => {
    const modal = document.getElementById('text2path-modal');
    const modalcontent = document.getElementById('text2path-modalcontent');
    const input = document.getElementById('text2path-input');

    if (modal === null) return;
    if (modalcontent === null) return;
    if (input === null) return;

    modal.style.display = 'block';
    modalcontent.style.left = `${event.pageX}px`;
    modalcontent.style.top = `${event.pageY}px`;

    input.focus();
  };

  // ツールパレット関連
  useEffect(() => {
    console.log(selectedTool);

    if (selectedTool === 'tool-select') setEventState('searchPath');
    else if (selectedTool === 'tool-text2Path') setEventState('text2path');
  }, [selectedTool]);

  // イベントリスナ管理
  type EventState = 'searchPath' | 'movePath' | 'dragArea' | 'text2path';
  type ElementId = 'canvas' | 'window' | 'document';
  const eventList: EventList<EventState, ElementId> = {
    searchPath: {
      canvas: {
        pointermove: [searchPath_canvas_pointermove],
        pointerdown: [searchPath_canvas_pointerdown],
      },

      document: {
        keyup: [searchPath_document_keyup],
      },
    },
    movePath: {
      document: {
        pointermove: [movePath_document_pointermove],
        pointerup: [movePath_document_pointerup],
      },
    },
    dragArea: {
      document: {
        pointermove: [dragArea_document_pointermove_AreaUpdate, dragArea_document_pointermove_HitTest],
        pointerup: [dragArea_document_pointerup],
      },
    },
    text2path: {
      canvas: {
        pointermove: [text2path_canvas_pointermove],
        click: [text2path_canvas_click],
      },
    },
  };
  const [eventState, setEventState] = useState<EventState>('searchPath');
  useEventListener(eventList, eventState, [textPaths, eventState]);
};
