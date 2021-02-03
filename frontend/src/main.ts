import {
  Application,
  Graphics,
  InteractionEvent,
  Rectangle,
  Point,
} from './View/pixi';
import Viewport from './Viewport';
import Graph from './Graph';
// import Graph from './Graph';

const app = new Application({
  antialias: true,
  autoStart: true,
  backgroundColor: 0x0d1117,
  resolution: 1,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);
setTimeout(() => {
  // app.ticker.maxFPS = 10;
  // console.log('app ticker limited');
}, 0);

const viewport = new Viewport();
app.stage.addChild(viewport);

viewport.enablePan();
viewport.enableScroll();
viewport.sortableChildren = true;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: No overload matches this call
app.view.addEventListener('mousewheel', (event: MouseEvent) => {
  event.preventDefault();

  const mousePosition = new Point(event.clientX, event.clientY);

  // returns element directly under mouse
  const found = app.renderer.plugins.interaction.hitTest(
    mousePosition,
    app.stage
  );

  if (found) {
    found.emit('scroll', event);
  }
});

// const graph = new Graph(viewport, {
//   allowSelfLoops: false,
// });

// graph.addNode('a', {
//   color: 0xff0000,
//   radius: 20,
//   x: 50,
//   y: 50,
// });

// graph.addNode('b', {
//   color: 0x00ff00,
//   radius: 40,
//   x: 300,
//   y: 80,
// });

// graph.addEdge('a', 'b', {
//   color: 0x0000ff,
//   width: 5,
// });

// setTimeout(() => {
//   console.log('a');
//   graph.mergeNodeAttributes('a', {x: 100});
// }, 1000);

import {GraphOptions, Attributes} from 'graphology-types';
import {clusters} from 'graphology-generators/random';
const noverlap = require('graphology-layout-noverlap');

class GraphCompatible extends Graph {
  constructor(options?: GraphOptions<Attributes>) {
    super(viewport, options);
  }
}

const graph = clusters(GraphCompatible, {
  order: 1000,
  size: 5000,
  clusters: 5,
});
const positions = noverlap(graph, 59);

for (const key in positions) {
  graph.mergeNodeAttributes(key, {
    x: positions[key].x * 20,
    y: positions[key].y * 20,
    color: 0x00ff00,
  });
}

console.log('edges', graph.size, 'nodes', graph.order);
