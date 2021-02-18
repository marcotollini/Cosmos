import Viewport from '../Viewport';

class ResizeManager {
  viewport: Viewport;

  constructor(viewport: Viewport) {
    this.viewport = viewport;
  }

  enable() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  disable() {
    window.removeEventListener('resize', this.resize);
  }

  resize() {
    const {width, height} = this.viewport.getCanvasDimension();
    this.viewport.application.renderer.resize(width, height);
    this.viewport.updateHitArea();
    this.viewport.tickerManager.burst();
  }
}

export default ResizeManager;
