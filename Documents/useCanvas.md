# リスナの適用範囲がcanvasのみだった時のuseCanvas(抜粋)
```tsx
type canvasEventKey = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerout' | 'pointerover';
type CanvasEvent = (event: globalThis.PointerEvent) => any;
type CanvasEvents = {
  [key in canvasEventKey]?: CanvasEvent[];
};
type CanvasState = 'searchPath' | 'movePath' | 'dragArea' | 'movePathOut' | 'dragAreaOut';
type CanvasEventsList = { [key in CanvasState]: CanvasEvents };

// Canvas上のイベントリスナ管理
const canvasEventList: CanvasEventsList = {
  searchPath: {
    pointermove: [searchPath_Move],
    pointerdown: [searchPath_Down],
  },
  movePath: {
    pointermove: [movePath_Move],
    pointerup: [movePath_Up],
    pointerout: [movePath_Out],
  },
  dragArea: {
    pointermove: [dragArea_Move_AreaUpdate, dragArea_Move_HitTest],
    pointerup: [dragArea_Up],
    pointerout: [dragArea_Out],
  },
  movePathOut: { pointerover: [mouvePathOver_Over] },
  dragAreaOut: { pointerover: [dragAreaOut_Over] },
};
const [canvasState, setCanvasState] = useState<CanvasState>('searchPath');
useEffect(() => {
  const addEvents = Object.entries(canvasEventList[canvasState]) as [canvasEventKey, CanvasEvent[]][];
  addEvents.forEach(([key, values]) => {
    values.forEach((value) => {
      canvas.current?.addEventListener(key, value);
    });
  });

  return () => {
    const removeEvents = Object.entries(canvasEventList[canvasState]) as [canvasEventKey, CanvasEvent[]][];
    removeEvents.forEach(([key, values]) => {
      values.forEach((value) => {
        canvas.current?.removeEventListener(key, value);
      });
    });
  };
}, [textPaths, canvasState]);
```
