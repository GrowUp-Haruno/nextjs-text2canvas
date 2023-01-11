# 旧式path選択のロジック
先頭のpathから順番にクリックした位置がoffsetとendpointの範囲内かを判定していた
```ts
const hitTextPath = textPaths
  .slice()
  .reverse()
  .find((textPath, i) => {
    if (clickPositionX < textPath.offset.x) return false;
    if (clickPositionX > textPath.endPoint.x) return false;
    if (clickPositionY < textPath.endPoint.y) return false;
    if (clickPositionY > textPath.offset.y) return false;

    hitIndex = textPaths.length - i - 1;
    return true;
  });
```