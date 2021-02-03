import {Point} from 'pixi.js';
import {default as TickerManager} from '../TickerManager';

class Zoom {
  minZoom = 0.05;
  maxZoom = 20;
  numberLevels = 10;

  toLocal!: Function;
  toGlobal!: Function;
  scale!: {x: number; y: number; set: Function};
  position!: {x: number; y: number; set: Function};
  tickerManager!: TickerManager;
  emit!: Function;

  scroll(event: WheelEvent) {
    if (event.deltaY === 0) return;

    this.tickerManager.burst();

    const scrolly = -event.deltaY;

    const mouse = new Point(event.clientX, event.clientY);
    const mouseloc = this.toLocal(mouse);

    const scalex = Math.min(
      Math.max(this.scale.x + scrolly * 0.01, this.minZoom),
      this.maxZoom
    );
    const scaley = Math.min(
      Math.max(this.scale.y + scrolly * 0.01, this.minZoom),
      this.maxZoom
    );

    if (scalex === this.scale.x) {
      return;
    }

    this.scale.set(scalex, scaley);

    const movedMouseglob = this.toGlobal(mouseloc);

    this.position.set(
      this.position.x - (movedMouseglob.x - mouse.x),
      this.position.y - (movedMouseglob.y - mouse.y)
    );

    this.emit('scrolling');
  }

  getZoomLevel() {
    const scalex = this.scale.x;
    return Math.floor((scalex - this.minZoom) / this.numberLevels);
  }
}

export default Zoom;
