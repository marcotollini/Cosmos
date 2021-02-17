import {InteractionEvent} from 'pixi.js';

import Viewport from '../Viewport';

interface Point {
  x: number;
  y: number;
}

class EventManager {
  viewport: Viewport;
  leftEvent: Event;
  touchEvent: Event;
  rightEvent: Event;
  // scrollEvent: Event;

  constructor(viewport: Viewport) {
    this.viewport = viewport;

    this.leftEvent = new Event(
      'left',
      this.viewport,
      'mousedown',
      'mouseup',
      'mousemove',
      'mouseupoutside'
    );

    this.touchEvent = new Event(
      'touch',
      this.viewport,
      'touchstart',
      'touchend',
      'touchmove',
      'touchendoutside'
    );

    this.rightEvent = new Event(
      'right',
      this.viewport,
      'rightdown',
      'rightup',
      'mousemove',
      'rightupoutside'
    );
  }

  enable() {
    this.viewport.interactive = true;
  }

  disable() {
    this.viewport.interactive = false;
  }

  leftEnable() {
    this.leftEvent.enable();
  }

  leftDisable() {
    this.leftEvent.disable();
  }

  touchEnable() {
    this.touchEvent.enable();
  }

  touchDisable() {
    this.touchEvent.disable();
  }

  rightEnable() {
    this.rightEvent.enable();
  }

  rightDisable() {
    this.rightEvent.disable();
  }

  scrollEnable() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: No overload matches this call
    this.viewport.application.view.addEventListener(
      'mousewheel',
      this.scrollManager.bind(this)
    );
  }

  scrollDisable() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: No overload matches this call
    this.viewport.application.view.removeEventListener(
      'mousewheel',
      this.scrollManager
    );
  }

  scrollManager(event: MouseEvent) {
    event.preventDefault();
    this.viewport.emit('viewport_scroll', event);
  }
}

class Event {
  viewport: Viewport;
  name: string;

  downName: string;
  upName: string;
  moveName: string;
  upOutsideName: string;

  state: {
    moved: boolean;
    doubleclickTimer: number | undefined;
    x: number;
    y: number;
  };

  constructor(
    name: string,
    viewport: Viewport,
    downName: string,
    upName: string,
    moveName: string,
    upOutsideName: string
  ) {
    this.viewport = viewport;
    this.name = name;

    this.downName = downName;
    this.upName = upName;
    this.moveName = moveName;
    this.upOutsideName = upOutsideName;

    this.state = {
      moved: false,
      doubleclickTimer: undefined,
      x: 0,
      y: 0,
    };
  }

  enable() {
    this.viewport.on(this.downName, this.start, this);
  }

  disable() {
    this.viewport.off(this.downName, this.start, this);

    this.clean();
  }

  start(event: InteractionEvent) {
    this.state.moved = false;
    this.state.x = event.data.global.x;
    this.state.y = event.data.global.y;

    this.viewport.on(this.moveName, this.move, this);
    this.viewport.on(this.upName, this.finish, this);
    this.viewport.on(this.upOutsideName, this.finish, this);
  }

  move(event: InteractionEvent) {
    const moved: Point = {
      x: this.state.x - event.data.global.x,
      y: this.state.y - event.data.global.y,
    };

    // if we move less than a px, probably we are not really leftning
    if (Math.abs(moved.x) < 1 && Math.abs(moved.y) < 1) return;
    this.state.moved = true;

    const position: Point = {
      x: event.data.global.x,
      y: event.data.global.y,
    };

    this.state.x = position.x;
    this.state.y = position.y;

    this.viewport.emit(`viewport_${this.name}_pan`, {moved, position});
  }

  finish(event: InteractionEvent) {
    if (!this.state.moved) {
      const position: Point = {
        x: event.data.global.x,
        y: event.data.global.y,
      };

      if (this.state.doubleclickTimer !== undefined) {
        window.clearTimeout(this.state.doubleclickTimer);
        this.state.doubleclickTimer = undefined;

        this.viewport.emit(`viewport_${this.name}_doubleclick`, position);
      } else {
        this.state.doubleclickTimer = window.setTimeout(() => {
          this.viewport.emit(`viewport_${this.name}_click`, position);

          this.state.doubleclickTimer = undefined;
        }, 300);
      }
    }

    this.clean();
  }

  clean() {
    this.state.moved = false;

    this.viewport.off(this.moveName, this.move, this);
    this.viewport.off(this.upName, this.finish, this);
    this.viewport.off(this.upOutsideName, this.finish, this);
  }
}

export default EventManager;
