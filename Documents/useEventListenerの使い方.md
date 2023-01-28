# useEventListener の使い方

## 準備

任意のディレクトリに useEventListener.tsx を配置

## 使い方

作業は使用するコンポーネントまたはカスタムフックで行ってください。

1. `useEventListener.tsx`から`EventList`, `EventListener`, `useEventListener`をインポート
2. 制御対象のエレメント id または document,window を文字列リテラルとしてエイリアス宣言

   ```tsx
   type ElementId = 'canvas' | 'window' | 'document';
   ```

3. イベントリスナーの切り替えを管理するための管理ステート名を文字列リテラルとしてエイリアス宣言

   ```tsx
   type EventState = 'searchPath' | 'movePath' | 'dragArea';
   ```

4. エイリアス`EventState`を用いて管理ステートを定義

   ```tsx
   const [eventState, setEventState] = useState<EventState>('searchPath');
   ```

5. イベントリスナー用の関数式を作成

   - 関数式の変数にインポートしたエイリアス`EventListener`を型注釈して、ジェネリクスに`pointermove`などのイベント名を入れると、第一引数`event`の詳細な型が自動的に切替わります。
   - 第一引数`event`を使用しない場合は上記の型注釈は不要です。
   - 変数名は任意
   - 管理ステートを切り替えたい場合は、関数内で setState を実行する。
   - 後に紹介するラッパー関数がイベントリスナーの切替を行うため、addEventListener や removeEventListener の記述は不要です）

     記入例

   ```tsx
   const searchPath_canvas_pointerdown: EventListener<'pointerdown'> = (event) => {
     setEventState('movePath');
   };
   ```

6. イベントの管理ステートとイベントリスナーを紐づけるためのオブジェクト作成

   - オブジェクト変数にインポートした`EventList`を型注釈して、ジェネリクスにエイリアス`EventState`、`ElementId`を入れると、コード補完を利用することができます。
   - オブジェクトの構造は次の通り
     ```ts
     {
       管理ステート名: {
         制御対象のエレメント: {
           イベント名: [イベントリスナー用の関数式1, イベントリスナー用の関数式2];
         },
       },
     }
     ```
   - `イベント名`は`pointermove`や`mousemove`などの指定が可能（使用できるイベント名は補完機能で確認可能）
   - `イベントリスナー用の関数式`は複数の指定が可能

   記入例

   ```tsx
   const eventList: EventList<EventState, ElementId> = {
     searchPath: {
       canvas: {
         pointermove: [searchPath_canvas_pointermove],
         pointerdown: [searchPath_canvas_pointerdown],
       },
     },
     movePath: {
       document: {
         pointermove: [movePath_document_pointermove],
         pointerup: [movePath_document_pointerup],
       },
     },
     dragArea: {
       window: {
         pointermove: [dragArea_window_pointermove, dragArea_document_pointermove_HitTest],
         pointerup: [dragArea_window_pointerup],
       },
     },
   };
   ```

7. インポートした`useEventListener`の引数を指定
   - 第一引数: 4.の管理ステート
   - 第二引数: 6.のオブジェクト
   - 第三引数: 依存配列（内部のuseEffectの依存配列で用いる）
     - 4.の管理ステートは必須


## 使用例
```tsx
import { useEffect, useRef, useState } from "react";
import {
  useEventListener,
  EventList,
  EventListener
} from "./hooks/useEventListener";
import "./styles.css";

export default function App() {
  type EventState = "searchBox" | "moveBox";
  const [eventState, setEventState] = useState<EventState>("searchBox");

  const box = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const startMouse = useRef({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  function apply() {
    if (box.current === null) return;
    box.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
  }
  useEffect(() => {
    box.current = document.getElementById("box") as HTMLDivElement | null;
    frame.current = document.getElementById("frame") as HTMLDivElement | null;
    apply();
  }, []);

  const searchBox_box_pointerdown: EventListener<"pointerdown"> = (event) => {
    startMouse.current = { x: event.screenX, y: event.screenY };
    start.current = { x: position.current.x, y: position.current.y };
    setEventState("moveBox");
  };

  const moveBox_document_pointerup: EventListener<"pointerup"> = (event) => {
    if (frame.current === null) return;
    if (box.current === null) return;

    if (position.current.x < 0) {
      position.current.x = 0;
    } else if (
      position.current.x >
      frame.current.offsetWidth - box.current.offsetWidth
    ) {
      position.current.x = frame.current.offsetWidth - box.current.offsetWidth;
    }
    if (position.current.y < 0) {
      position.current.y = 0;
    } else if (
      position.current.y >
      frame.current.offsetHeight - box.current.offsetHeight
    ) {
      position.current.y =
        frame.current.offsetHeight - box.current.offsetHeight;
    }

    apply();
    setEventState("searchBox");
  };

  const moveBox_document_pointermove: EventListener<"pointermove"> = (
    event
  ) => {
    if (frame.current === null) return;
    if (box.current === null) return;

    position.current.x = start.current.x + event.screenX - startMouse.current.x;
    position.current.y = start.current.y + event.screenY - startMouse.current.y;
    if (position.current.x < 0) {
      position.current.x = -Math.sqrt(-position.current.x);
    } else if (
      position.current.x >
      frame.current.offsetWidth - box.current.offsetWidth
    ) {
      position.current.x =
        frame.current.offsetWidth -
        box.current.offsetWidth +
        Math.sqrt(
          position.current.x -
            frame.current.offsetWidth +
            box.current.offsetWidth
        );
    }
    if (position.current.y < 0) {
      position.current.y = -Math.sqrt(-position.current.y);
    } else if (
      position.current.y >
      frame.current.offsetHeight - box.current.offsetHeight
    ) {
      position.current.y =
        frame.current.offsetHeight -
        box.current.offsetHeight +
        Math.sqrt(
          position.current.y -
            frame.current.offsetHeight +
            box.current.offsetHeight
        );
    }
    apply();
  };

  // イベントリスナ管理
  type ElementId = "box" | "document";
  const eventList: EventList<EventState, ElementId> = {
    searchBox: {
      box: {
        pointerdown: [searchBox_box_pointerdown]
      }
    },
    moveBox: {
      document: {
        pointermove: [moveBox_document_pointermove],
        pointerup: [moveBox_document_pointerup]
      }
    }
  };

  useEventListener(eventList, eventState, [eventState]);

  return (
    <div id="frame">
      <div id="box"></div>
    </div>
  );
}

```