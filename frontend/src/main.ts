import {Application, Ticker} from 'pixi.js';

import Viewport from './Viewport';
import Graph from './Graph';

const canvas = document.getElementById('canv') as HTMLCanvasElement;

const app = new Application({
  antialias: true,
  autoStart: true,
  backgroundColor: 0x0d1117,
  resolution: 1,
  view: canvas,
  width: canvas.clientWidth,
  height: canvas.clientHeight,
});

document.body.appendChild(app.view);

const viewport = new Viewport(app);
app.stage.addChild(viewport);

import {Graphics} from 'pixi.js';

// const circle = new Graphics();
// circle.beginFill(0xffffff);
// circle.drawCircle(0, 0, 15);
// circle.endFill();
// circle.x = 100;
// circle.y = 10;
// circle.interactive = true;
// circle.zIndex = 100;
// circle.name = 'circle';
// viewport.addChild(circle);

// const circle2 = new Graphics();
// circle2.beginFill(0xffffff);
// circle2.drawCircle(0, 0, 20);
// circle2.endFill();
// circle2.width = 30;
// circle2.height = 30;
// circle2.x = 534;
// circle2.y = 254;
// circle2.interactive = true;
// circle2.zIndex = 100;
// circle2.name = 'circle2';
// circle2.tint = 0xff0000;
// circle2.tint = 0x0000ff;
// viewport.addChild(circle2);

// const rect = new Graphics();
// rect.beginFill(0xffff00);
// rect.drawRect(0, 0, 1, 1);

// rect.width = Math.sqrt(
//   (circle.x - circle2.x) ** 2 + (circle.y - circle2.y) ** 2
// );
// rect.height = 6;

// rect.endFill();
// rect.x = circle.x;
// rect.y = circle.y;
// rect.pivot.set(0, 0.5);
// rect.rotation = Math.atan2(circle2.y - circle.y, circle2.x - circle.x);
// rect.name = 'line';
// rect.zIndex = 50;
// rect.interactive = true;
// viewport.addChild(rect);

// viewport.tickerManager.burst();

// import {DisplayObject, InteractionEvent} from 'pixi.js';
// rect.on('mouseover', (event: InteractionEvent) => {
//   rect.height *= 1.5;
//   viewport.tickerManager.burst();
// });

// rect.on('mouseout', (event: InteractionEvent) => {
//   rect.height /= 1.5;
//   viewport.tickerManager.burst();
// });

// circle.on('mouseover', (event: InteractionEvent) => {
//   circle.height *= 1.5;
//   circle.width *= 1.5;
//   viewport.tickerManager.burst();
// });

// circle.on('mouseout', (event: InteractionEvent) => {
//   circle.height /= 1.5;
//   circle.width /= 1.5;
//   viewport.tickerManager.burst();
// });

// circle2.on('mouseover', (event: InteractionEvent) => {
//   circle2.height *= 1.5;
//   circle2.width *= 1.5;
//   viewport.tickerManager.burst();
// });

// circle2.on('mouseout', (event: InteractionEvent) => {
//   circle2.height /= 1.5;
//   circle2.width /= 1.5;
//   viewport.tickerManager.burst();
// });

// import {UndirectedGraph} from 'graphology';
// const g = new UndirectedGraph();
// g.on('nodeAttributesUpdated', (type: Object) => {
//   console.log(type);
//   // During merge, we add new key, and we substitute keys that are already there. Thus, there is not merge on multiple level,
//   // but the properties need to be flat
//   // key is the node key
//   // data is the object given to merge
//   // attributes is the modified and merged object
//   // type is merge

//   // On remove
//   // key
//   // name is the key that have been removed
//   // type remove
//   // attributes the list of attributes

//   // nice :)
// });

// const n = g.addNode('a', {
//   color: 'red',
//   radius: {
//     test: false,
//     test2: true,
//   },
//   x: 20,
//   y: 30,
// });

// g.mergeNodeAttributes(n, {color: 'green', radius: {test: true}, test: 10});
// g.removeNodeAttribute(n, 'radius');

const graph = new Graph(viewport, {
  allowSelfLoops: false,
});

graph.addNode('a', {
  tint: 0xff0000,
  x: 50,
  y: 50,
});

graph.addNode('b', {
  tint: 0x00ff00,
  x: 300,
  y: 80,
});

graph.addEdge('a', 'b', {
  tint: 0x0000ff,
});

viewport.tickerManager.burst();
// setTimeout(() => {
//   console.log('a');
//   graph.mergeNodeAttributes('a', {x: 100});
// }, 1000);
