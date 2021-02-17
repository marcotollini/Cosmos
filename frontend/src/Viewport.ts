import {Application, Container, Rectangle} from 'pixi.js';

import EventManager from './ViewportComponents/EventManager';
import ZoomManager from './ViewportComponents/ZoomManager';
import PanManager from './ViewportComponents/PanManager';
import TickerManager from './ViewportComponents/TickerManager';

class Viewport extends Container {
  name = 'viewport';
  application: Application;
  eventManager: EventManager;
  zoomManager: ZoomManager;
  panManager: PanManager;
  tickerManager: TickerManager;

  hitArea: Rectangle;

  constructor(app: Application) {
    super();

    this.application = app;
    this.eventManager = new EventManager(this);
    this.zoomManager = new ZoomManager(this);
    this.panManager = new PanManager(this);
    this.tickerManager = new TickerManager(this.application.ticker);

    this.hitArea = new Rectangle(0, 0, 0, 0);
    this.updateHitArea();

    this.eventManager.enable();
    this.eventManager.leftEnable();
    this.eventManager.rightEnable();
    this.eventManager.touchEnable();
    this.eventManager.scrollEnable();

    this.zoomManager.enable();
    this.panManager.enable();
  }

  setPosition(x: number, y: number) {
    this.position.set(x, y);
    this.updateHitArea();

    this.tickerManager.burst();
  }

  updateHitArea() {
    this.hitArea.x = -this.position.x * (1 / this.scale.x);
    this.hitArea.y = -this.position.y * (1 / this.scale.y);

    const {width, height} = this.getCanvasDimension();
    this.hitArea.width = width * (1 / this.scale.x);
    this.hitArea.height = height * (1 / this.scale.y);
  }

  getCanvasDimension() {
    const width = this.application.view.clientWidth;
    const height = this.application.view.clientHeight;

    return {width, height};
  }
}

export default Viewport;
