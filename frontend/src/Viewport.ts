import {Mixin} from 'ts-mixer';

import {Container, Rectangle, Application, Renderer} from './pixi';
import Pan from './View/Pan';
import Zoom from './View/Zoom';
import Resize from './View/Resize';
import TickerManager from './TickerManager';

class Viewport extends Mixin(Container, Pan, Zoom, Resize) {
  name = 'viewport';
  tickerManager: TickerManager;
  renderer: Renderer;
  view: HTMLCanvasElement;
  hitArea = new Rectangle(-100000 / 2, -100000 / 2, 100000, 100000);

  constructor(app: Application) {
    super();

    this.tickerManager = new TickerManager(app.ticker);
    this.renderer = app.renderer;
    this.view = app.view;

    this.on('pan', this.calculateHitArea);
    this.on('scrolling', this.calculateHitArea);
  }

  calculateHitArea() {
    this.hitArea.x = -this.position.x / this.scale.x;
    this.hitArea.y = -this.position.y / this.scale.y;
    this.hitArea.width = window.innerWidth / this.scale.x;
    this.hitArea.height = window.innerHeight / this.scale.y;
    console.log(this.hitArea);
  }

  enablePan() {
    this.interactive = true;
    this.on('mousedown', this.mouseDown);
  }

  disablePan() {
    this.off('mousedown', this.mouseDown);
    this.off('mouseup', this.mouseUp);
    this.off('mousemove', this.mouseMove);
  }

  enableScroll() {
    this.on('scroll', this.scroll);
  }

  disableScroll() {
    this.off('scroll', this.scroll);
  }

  setFullScreen() {
    this._setFullScreen();
  }

  enableAutoFullScreen() {
    window.onresize = this._setFullScreen.bind(this);
  }

  disableAutoFullScreen() {
    window.onresize = null;
  }
}

export default Viewport;
