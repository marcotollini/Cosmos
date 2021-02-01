import {Mixin} from 'ts-mixer';

import {Container, Rectangle} from './pixi';
import Pan from './Pan';
import Zoom from './Zoom';

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
