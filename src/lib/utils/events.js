export function nestEvents(flatEvents) {
  const eventMap = {};
  const nestedEvents = [];
  if(!flatEvents) return nestedEvents;

  // Create a map of events with their ids as keys
  flatEvents.forEach(event => {
    eventMap[event.event_id] = event;
    event.children = []; // Add a "children" property to store nested events
  });

  // Iterate over the events to build the nested structure
  flatEvents.forEach(event => {
    const parentId = event.content['m.relates_to']?.['m.in_reply_to']?.['event_id'];
    const parentEvent = eventMap[parentId];

    if (parentEvent) {
      // If the parent event exists, add the current event as its child
      parentEvent.children.push(event);
    } else {
      // If there is no parent event, add the event to the top-level
      nestedEvents.push(event);
    }
  });

  return nestedEvents;
}

