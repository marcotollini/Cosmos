import {Point} from 'pixi.js';

class Zoom {
  toLocal!: Function;
  toGlobal!: Function;
  scale!: {x: number; y: number; set: Function};
  position!: {x: number; y: number; set: Function};

  scroll(event: WheelEvent) {
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
  }
}

export default Zoom;
