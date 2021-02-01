import {Mixin} from 'ts-mixer';

import {Container, Rectangle} from './pixi';
import Pan from './Pan';
import {Point} from 'pixi.js';

class Viewport extends Mixin(Container, Pan) {
  name = 'viewport';

  enablePan() {
    this.interactive = true;
    this.hitArea = new Rectangle(-100000 / 2, -100000 / 2, 100000, 100000);

    this.on('mousedown', this.mouseDown);

    this.on('scroll', (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      const scrolly = -event.deltaY;

      const mouse = new Point(event.clientX, event.clientY);
      const mouseloc = this.toLocal(mouse);

      const scalex = Math.max(this.scale.x + scrolly * 0.01, 0.2);
      const scaley = Math.max(this.scale.y + scrolly * 0.01, 0.2);

      if (scalex === this.scale.x) {
        return;
      }

      this.scale.set(scalex, scaley);

      const movedMouseglob = this.toGlobal(mouseloc);

      this.position.set(
        this.position.x - (movedMouseglob.x - mouse.x),
        this.position.y - (movedMouseglob.y - mouse.y)
      );
    });
  }

  disablePan() {
    this.off('mousedown', this.mouseDown);
    this.off('mouseup', this.mouseUp);
    this.off('mousemove', this.mouseMove);
  }
}

export default Viewport;
