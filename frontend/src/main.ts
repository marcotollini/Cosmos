import {Application} from './pixi';
import Viewport from './Viewport';
import Graph from './Graph';

const app = new Application({
  antialias: true,
  autoStart: true,
  backgroundColor: 0x0d1117,
  resolution: 1,
});

document.body.appendChild(app.view);

const viewport = new Viewport(app);
app.stage.addChild(viewport);

viewport.enablePan();
viewport.enableScroll();
viewport.sortableChildren = true;
viewport.setFullScreen();
viewport.enableAutoFullScreen();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: No overload matches this call
app.view.addEventListener('mousewheel', (event: MouseEvent) => {
  event.preventDefault();

  // if (viewport.hitArea.contains(event.clientX, event.clientY)) {
  viewport.emit('scroll', event);
  // }
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
import {circlepack} from 'graphology-layout';

class GraphCompatible extends Graph {
  constructor(options?: GraphOptions<Attributes>) {
    super(viewport, options);
  }
}

const graph = clusters(GraphCompatible, {
  order: 6000,
  size: 1,
  clusters: 5,
});
const positions = circlepack(graph);

for (const key in positions) {
  graph.mergeNodeAttributes(key, {
    x: positions[key].x * 50,
    y: positions[key].y * 50,
    color: 0x00ff00,
  });
}
viewport.tickerManager.update();
