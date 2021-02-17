import Viewport from '../Viewport';

interface Point {
  x: number;
  y: number;
}

class PanManager {
  viewport: Viewport;

  constructor(viewport: Viewport) {
    this.viewport = viewport;
  }

  enable() {
    this.viewport.on('viewport_left_pan', this.pan, this);
    this.viewport.on('viewport_touch_pan', this.pan, this);
  }

  disable() {
    this.viewport.off('viewport_left_pan', this.pan);
    this.viewport.off('viewport_touch_pan', this.pan);
  }

  pan(event: {moved: Point; position: Point}) {
    this.viewport.setPosition(
      this.viewport.position.x - event.moved.x,
      this.viewport.position.y - event.moved.y
    );
  }
}

export default PanManager;
