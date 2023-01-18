import { DependencyList, useEffect } from 'react';

type EventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerout' | 'pointerover';
type EventListener = (event: globalThis.PointerEvent) => any;
type EventSetting = { [key in EventType]?: EventListener[] };
type ElementId = 'canvas' | 'page';
type EventListEntries = [ElementId, EventSetting][];
type EventSettingEntries = [EventType, EventListener[]][];
export type EventState = 'searchPath' | 'movePath' | 'dragArea' | 'movePathOut' | 'dragAreaOut';
export type EventsList = { [key in EventState]: { [id in ElementId]?: EventSetting } };

export const useEventListener = (eventList: EventsList, eventState: EventState, deps?: DependencyList | undefined) => {
  useEffect(() => {
    eventListenerManagement('addEventListener', eventList, eventState);
    return () => {
      eventListenerManagement('removeEventListener', eventList, eventState);
    };
  }, deps);
};

function eventListenerManagement(
  eventManagementType: 'addEventListener' | 'removeEventListener',
  eventList: EventsList,
  eventState: EventState
) {
  const eventListEntries = Object.entries(eventList[eventState]) as EventListEntries;
  eventListEntries.forEach(([elementId, eventSetting]) => {
    const element = document.getElementById(elementId);
    const eventSettingEntries = Object.entries(eventSetting) as EventSettingEntries;
    eventSettingEntries.forEach(([eventType, eventListeners]) => {
      eventListeners.forEach((eventListener) => {
        if (eventManagementType === 'addEventListener') element?.addEventListener(eventType, eventListener);
        if (eventManagementType === 'removeEventListener') element?.removeEventListener(eventType, eventListener);
      });
    });
  });
}
