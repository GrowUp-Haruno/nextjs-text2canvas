import { TextPath } from '../types/TextPath';

export const isSelectedReset = (textPaths: TextPath[]) => {
  const newArray = textPaths.map((textPath) => ({ ...textPath, isSelected: false }));
  return [...newArray];
};

export const isSelectedDelete = (textPaths: TextPath[]) => {
  const newArray = textPaths.filter((textPath) => textPath.isSelected === false);
  return [...newArray];
};

export const getNewTextPaths = ({ textPaths, draggedArea }: { textPaths: TextPath[]; draggedArea: TextPath }) => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
  if (canvas === null) return textPaths;
  const canvasCtx = canvas.getContext('2d');
  if (canvasCtx === null) return textPaths;

  const newTextPath = textPaths.map((textPath) => {
    const testPath2D = new Path2D(textPath.path2D);
    const x = draggedArea.offset.x;
    const y = draggedArea.endPoint.y;
    const w = draggedArea.endPoint.x - draggedArea.offset.x + 2;
    const h = draggedArea.offset.y - draggedArea.endPoint.y + 2;
    // w,hのうちどちらかが2未満の場合、ヒットの有無に関係なくisPointInPathが
    // falseになるため、各計算結果に２を加算する
    testPath2D.rect(x, y, w, h);

    let isPointInPaht = true;
    const endX = x + w;
    const endY = y + h;
    for (let ix = x; ix <= endX; ix++) {
      for (let iy = y; iy <= endY; iy++) {
        isPointInPaht = canvasCtx.isPointInPath(testPath2D, ix, iy);
        if (isPointInPaht === false) break;
      }
      if (isPointInPaht === false) break;
    }
    textPath.isSelected = !isPointInPaht;
    return textPath;
  });

  return newTextPath;
};
