import * as PIXI from 'pixi.js';
const Graphics = PIXI.Graphics;
const Container = PIXI.Container;

const app = new PIXI.Application({
  antialias: true,
  autoStart: false,
  backgroundColor: 0x0d1117,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

const circle = new Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 32);
circle.endFill();
circle.x = 54;
circle.y = 50;

// app.stage.addChild(circle);

app.ticker.update();

app.ticker.add(gameLoop);

function gameLoop() {
  //Move the cat 1 pixel
  console.log('called');
}

app.ticker.update();

const circle2 = new Graphics();
circle2.beginFill(0xffffff);
circle2.drawCircle(0, 0, 32);
circle2.endFill();
circle2.x = 64;
circle2.y = 60;

const circles = new Container();
// ParticleContainer: more performant with some limitation
circles.addChild(circle);
circles.addChild(circle2);

app.stage.addChild(circles);

app.ticker.update();

setTimeout(() => {
  circles.x = 100;
  circles.y = 100;
  console.log(circles.toGlobal(circle2.position));
  console.log(circle2.getGlobalPosition());
  console.log(circle2.position);
  app.ticker.update();
}, 1000);
