import { Coordinates, TextPath } from '../types/TextPath';

export const isSelectedReset = (textPaths: TextPath[]) => {
  const newArray = textPaths.map((textPath) => ({ ...textPath, isSelected: false }));
  return [...newArray];
};

export const isSelectedDelete = (textPaths: TextPath[]) => {
  const newArray = textPaths.filter((textPath) => textPath.isSelected === false);
  return [...newArray];
};

export const getNewTextPaths = ({
  textPaths,
  origin,
  distanceOriginToDrag,
}: {
  textPaths: TextPath[];
  origin: Coordinates;
  distanceOriginToDrag: Coordinates;
}) => {
  const newTextPath = textPaths.map((textPath) => {
    const distanceOriginToOffset_X = textPath.offset.x - origin.x;
    const distanceOriginToOffset_Y = textPath.offset.y - origin.y;
    const distanceOriginToEndpoint_X = textPath.endPoint.x - origin.x;
    const distanceOriginToEndpoint_Y = textPath.endPoint.y - origin.y;

    const isBetweenOffsetToEndpoint_X = distanceOriginToOffset_X < 0 && distanceOriginToEndpoint_X > 0;
    const isBetweenOffsetToEndpoint_Y = distanceOriginToOffset_Y > 0 && distanceOriginToEndpoint_Y < 0;

    let isDragLongerThanOffset_X = false;
    if (distanceOriginToOffset_X < 0) isDragLongerThanOffset_X = -distanceOriginToDrag.x > -distanceOriginToOffset_X;
    if (distanceOriginToOffset_X >= 0) isDragLongerThanOffset_X = distanceOriginToDrag.x > distanceOriginToOffset_X;

    let isDragLongerThanOffset_Y = false;
    if (distanceOriginToOffset_Y < 0) isDragLongerThanOffset_Y = -distanceOriginToDrag.y > -distanceOriginToOffset_Y;
    if (distanceOriginToOffset_Y >= 0) isDragLongerThanOffset_Y = distanceOriginToDrag.y > distanceOriginToOffset_Y;

    let isDragLongerThanEndpoint_X = false;
    if (distanceOriginToEndpoint_X < 0)
      isDragLongerThanEndpoint_X = -distanceOriginToDrag.x > -distanceOriginToEndpoint_X;
    if (distanceOriginToEndpoint_X >= 0)
      isDragLongerThanEndpoint_X = distanceOriginToDrag.x > distanceOriginToEndpoint_X;

    let isDragLongerThanEndpoint_Y = false;
    if (distanceOriginToEndpoint_Y < 0)
      isDragLongerThanEndpoint_Y = -distanceOriginToDrag.y > -distanceOriginToEndpoint_Y;
    if (distanceOriginToEndpoint_Y >= 0)
      isDragLongerThanEndpoint_Y = distanceOriginToDrag.y > distanceOriginToEndpoint_Y;

    textPath.isSelected = false;
    if (isBetweenOffsetToEndpoint_X && isDragLongerThanOffset_Y) textPath.isSelected = true;
    if (isBetweenOffsetToEndpoint_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
    if (isBetweenOffsetToEndpoint_Y && isDragLongerThanOffset_X) textPath.isSelected = true;
    if (isBetweenOffsetToEndpoint_Y && isDragLongerThanEndpoint_X) textPath.isSelected = true;

    if (isDragLongerThanOffset_X && isDragLongerThanOffset_Y) textPath.isSelected = true;
    if (isDragLongerThanOffset_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
    if (isDragLongerThanEndpoint_X && isDragLongerThanEndpoint_Y) textPath.isSelected = true;
    if (isDragLongerThanEndpoint_X && isDragLongerThanOffset_Y) textPath.isSelected = true;

    return textPath;
  });

  return newTextPath;
};
