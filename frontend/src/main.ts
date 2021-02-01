import {
  Application,
  Graphics,
  InteractionEvent,
  Rectangle,
  Point,
} from './pixi';
import Viewport from './Viewport';

const app = new Application({
  antialias: true,
  autoStart: true,
  backgroundColor: 0x0d1117,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

const viewport = new Viewport();

const circle = new Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 32);
circle.endFill();
circle.x = 54;
circle.y = 50;
circle.name = 'circle';

const circle2 = new Graphics();
circle2.beginFill(0xff0000);
circle2.drawCircle(0, 0, 32);
circle2.endFill();
circle2.x = 304;
circle2.y = 50;
circle2.name = 'circle';

viewport.addChild(circle);
viewport.addChild(circle2);

app.stage.addChild(viewport);

viewport.enablePan();
viewport.enableScroll();

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
