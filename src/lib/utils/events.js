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

export function insertEvents(existingArray, newEvents) {
  const mergedArray = [...existingArray];

  for (const event of newEvents) {
    const index = mergedArray.findIndex(
      (item) => item.origin_server_ts === event.origin_server_ts
    );

    if (index === -1) {
      let low = 0;
      let high = mergedArray.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midTimestamp = mergedArray[mid].origin_server_ts;

        if (event.origin_server_ts === midTimestamp) {
          // If the event already exists in the array, skip insertion
          return;
        }

        if (event.origin_server_ts > midTimestamp) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      mergedArray.splice(low, 0, event);
    }
  }

  return mergedArray;
}

