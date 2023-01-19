import { DependencyList, useEffect } from 'react';

type EventType = keyof HTMLElementEventMap;
export type EventListener<Key extends EventType> = (this: HTMLElement, event: HTMLElementEventMap[Key]) => any;
type EventSetting = { [key in EventType]?: EventListener<key>[] };
type EventListEntries<ElementId extends string> = [ElementId, EventSetting][];
type EventSettingEntries = [EventType, EventListener<EventType>[]][];
export type EventsList<EventState extends string, ElementId extends string> = {
  [key in EventState]: { [id in ElementId]?: EventSetting };
};

export const useEventListener = <EventState extends string, ElementId extends string>(
  eventList: EventsList<EventState, ElementId>,
  eventState: EventState,
  deps?: DependencyList | undefined
) => {
  useEffect(() => {
    eventListenerManagement('addEventListener', eventList, eventState);
    return () => {
      eventListenerManagement('removeEventListener', eventList, eventState);
    };
  }, deps);
};

function eventListenerManagement<EventState extends string, ElementId extends string>(
  eventManagementType: 'addEventListener' | 'removeEventListener',
  eventList: EventsList<EventState, ElementId>,
  eventState: EventState
) {
  const eventListEntries = Object.entries(eventList[eventState]) as EventListEntries<ElementId>;
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
