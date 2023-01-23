# isPointInPathを用いたヒットテスト

```ts:setSelectedTextPath.ts
export function getNewSelectedArea(textPaths: TextPath[]): TextPath {
  let startPoint = { x: Infinity, y: Infinity };
  let endPoint = { x: -Infinity, y: -Infinity };

  const selectedTextPaths = textPaths.filter((textPath) => textPath.isSelected === true);
  selectedTextPaths.forEach((textPath) => {
    if (textPath.isSelected === false) return;

    if (startPoint.x > textPath.selectedArea.x) startPoint.x = textPath.selectedArea.x;
    if (startPoint.y > textPath.selectedArea.y) startPoint.y = textPath.selectedArea.y;

    const endX = textPath.selectedArea.x + textPath.selectedArea.w;
    const endY = textPath.selectedArea.y + textPath.selectedArea.h;
    if (endPoint.x < endX) endPoint.x = endX;
    if (endPoint.y < endY) endPoint.y = endY;
  });

  const w = endPoint.x - startPoint.x;
  const h = endPoint.y - startPoint.y;
  const selectedArea: SelectedArea = { x: startPoint.x, y: startPoint.y, w, h };
  const isSelected = selectedTextPaths.length === 1 ? false : true;
  const newTextPath: TextPath = { ...initialTextPath, isSelected, selectedArea };
  const selectedPath2D = getSelectedPath2D({ textPath: newTextPath });

  return { ...newTextPath, selectedPath2D };
}
```
