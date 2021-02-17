import {Point} from 'pixi.js';
import Viewport from '../Viewport';

class ZoomManager {
  viewport: Viewport;

  min: number;
  max: number;
  levels: number;
  constructor(viewport: Viewport) {
    this.min = 0.05;
    this.max = 20;
    this.levels = 10;

    this.viewport = viewport;
  }

  enable() {
    this.viewport.on('viewport_scroll', this.scroll, this);
  }

  disable() {
    this.viewport.off('viewport_scroll', this.scroll);
  }

  scroll(event: WheelEvent) {
    if (event.deltaY === 0) return;

    const scrolly = -event.deltaY;

    const mouse = new Point(event.offsetX, event.offsetY);
    const mouseloc = this.viewport.toLocal(mouse);

    const scalex = Math.min(
      Math.max(this.viewport.scale.x + scrolly * 0.01, this.min),
      this.max
    );
    const scaley = Math.min(
      Math.max(this.viewport.scale.y + scrolly * 0.01, this.min),
      this.max
    );

    if (scalex === this.viewport.scale.x) {
      return;
    }

    this.viewport.scale.set(scalex, scaley);

    const movedMouseglob = this.viewport.toGlobal(mouseloc);

    this.viewport.setPosition(
      this.viewport.position.x - (movedMouseglob.x - mouse.x),
      this.viewport.position.y - (movedMouseglob.y - mouse.y)
    );
  }
}

export default ZoomManager;
