import { DependencyList, useEffect } from 'react';

type EventKey = keyof HTMLElementEventMap;
type Event<Key extends EventKey> = HTMLElementEventMap[Key];
export type EventListener<Key extends EventKey> = (event: Event<Key>) => any;
type EventMap = { [key in EventKey]?: EventListener<key>[] };
export type EventList<EventState extends string, ElementId extends string> = {
  [key in EventState]: { [id in ElementId]?: EventMap };
};

export const useEventListener = <EventState extends string, ElementId extends string>(
  eventList: EventList<EventState, ElementId>,
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
  eventList: EventList<EventState, ElementId>,
  eventState: EventState
) {
  const eventListEntries = Object.entries(eventList[eventState]) as [ElementId, EventMap][];
  eventListEntries.forEach(([elementId, eventMap]) => {
    const element = document.getElementById(elementId);
    const eventSettingEntries = Object.entries(eventMap) as [EventKey, EventListener<EventKey>[]][];

    eventSettingEntries.forEach(([eventKey, eventListeners]) => {
      eventListeners.forEach((eventListener) => {
        if (eventManagementType === 'addEventListener') element?.addEventListener(eventKey, eventListener);
        if (eventManagementType === 'removeEventListener') element?.removeEventListener(eventKey, eventListener);
      });
    });
  });
}
