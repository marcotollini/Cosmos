import {Mixin} from 'ts-mixer';

import {Container, Rectangle} from './View/pixi';
import Pan from './View/Pan';
import Zoom from './View/Zoom';

class Viewport extends Mixin(Container, Pan, Zoom) {
  name = 'viewport';
  hitArea = new Rectangle(-100000 / 2, -100000 / 2, 100000, 100000);

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
}

export default Viewport;
