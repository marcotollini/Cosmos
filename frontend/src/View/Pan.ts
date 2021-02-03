import {InteractionEvent} from '../pixi';
import {default as TickerManager, TickerSpeed} from '../TickerManager';

class Pan {
  startCoordinates: {
    x: number;
    y: number;
  } = {x: 0, y: 0};

  position!: {x: number; y: number; set: Function};
  hitArea!: {x: number; y: number; width: number; height: number};
  tickerManager!: TickerManager;
  panTickerSpeed = TickerSpeed.Fast;
  emit!: Function;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  abstract on(event: string, fn: Function, context?: unknown);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  abstract off(event: string, fn: Function);

  savePanCoordinates(coord: {x: number; y: number}) {
    this.startCoordinates.x = coord.x;
    this.startCoordinates.y = coord.y;
  }

  calculteMoved(event: InteractionEvent) {
    const moved = {
      x: this.startCoordinates.x - event.data.global.x,
      y: this.startCoordinates.y - event.data.global.y,
    };

    this.savePanCoordinates(event.data.global);

    return moved;
  }

  setNewPosition(event: InteractionEvent) {
    const moved = this.calculteMoved(event);

    this.position.set(this.position.x - moved.x, this.position.y - moved.y);

    this.emit('pan');
  }

  mouseDown(event: InteractionEvent) {
    this.tickerManager.set(this.panTickerSpeed);
    this.savePanCoordinates(event.data.global);

    this.on('mousemove', this.mouseMove);
    this.on('mouseup', this.mouseUp);
    this.on('mouseout', this.mouseUp);
  }

  mouseMove(event: InteractionEvent) {
    this.setNewPosition(event);
  }

  mouseUp(event: InteractionEvent) {
    this.setNewPosition(event);

    this.tickerManager.end(this.panTickerSpeed);
    this.off('mousemove', this.mouseMove);
    this.off('mouseup', this.mouseUp);
    this.off('mouseout', this.mouseUp);
  }
}

export default Pan;
