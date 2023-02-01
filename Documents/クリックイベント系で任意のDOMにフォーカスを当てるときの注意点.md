# クリックイベント系で任意のDOMにフォーカスを当てるときの注意点
下記のコードで`pointerdown`ボタンをクリックした場合、inputがフォーカスされない

```tsx
import "./styles.css";

export default function App() {
  function focus() {
    const input = document.getElementById("input");
    if (input === null) return;
    input.focus();
  }
  return (
    <div className="App">
      <input id="input" type="text" />
      <button onPointerDown={focus}>pointerdown</button>
      <button onClick={focus}>click</button>
    </div>
  );
}

```