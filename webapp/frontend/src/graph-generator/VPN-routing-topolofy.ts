// const eventsInOut = statePkt.events.filter(
//   x => x.is_in === true || x.is_out === true
// );

// const [eventsIn, eventsOut] = partition(eventsInOut, x => x.is_in === true);

// const epMap: Record<string, [string, string | null, string | null][]> = {};
// for (const eventOut of eventsOut) {
//   if (eventOut.comms === null) continue;
//   const endPoints = eventOut.comms.filter(x => x.indexOf('64499') !== -1);
//   if (endPoints.length === 0) continue;
//   for (const endPoint of endPoints) {
//     if (!epMap[endPoint]) epMap[endPoint] = [];
//     epMap[endPoint].push([
//       eventOut.bmp_router,
//       eventOut.rd,
//       eventOut.peer_ip,
//     ]);
//   }
// }

// console.log(epMap);
