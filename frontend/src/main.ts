import {Application} from 'pixi.js';

import Viewport from './Viewport';

const app = new Application({
  antialias: true,
  autoStart: true,
  backgroundColor: 0x0d1117,
  resolution: 1,
});

document.body.appendChild(app.view);

const viewport = new Viewport(app);
app.stage.addChild(viewport);

import {Graphics} from 'pixi.js';

const circle = new Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 50);
circle.endFill();
circle.x = 0;
circle.y = 0;
circle.interactive = true;
circle.name = 'circle';

viewport.addChild(circle);

viewport.tickerManager.burst();
