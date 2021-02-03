import {Renderer} from '../pixi';
import TickerManager from '../TickerManager';

class Resize {
  renderer!: Renderer;
  view!: HTMLCanvasElement;
  tickerManager!: TickerManager;
  emit!: Function;

  _setFullScreen() {
    this.view.style.position = 'absolute';
    this.view.style.display = 'block';
    this.view.style.width = window.innerWidth + 'px';
    this.view.style.height = window.innerHeight + 'px';
    this.renderer.resize(window.innerWidth, window.innerHeight);

    this.tickerManager.burst();
  }
}

export default Resize;
