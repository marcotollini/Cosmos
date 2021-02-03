import {Ticker as PixiTicker} from './pixi';

enum TickerSpeed {
  Fast,
  Medium,
  Slow,
}

class TickerManager {
  minFPS: number;
  maxFPS: number;
  slowFPS: number;
  mediumFPS: number;
  fastFPS: number;

  requests: Record<TickerSpeed, number>;

  ticker: PixiTicker;

  isBurst = false;

  constructor(ticker: PixiTicker) {
    this.minFPS = 1;
    this.maxFPS = 60;
    this.slowFPS = this.minFPS;
    this.fastFPS = this.maxFPS;
    this.mediumFPS = Math.floor((this.maxFPS - this.minFPS) / 2);

    this.ticker = ticker;
    this.ticker.minFPS = this.minFPS;
    this.ticker.maxFPS = this.maxFPS;

    this.requests = {
      0: 0,
      1: 0,
      2: 0,
    };

    this._updateSpeed();
  }

  fast(): TickerSpeed {
    const speed = TickerSpeed.Fast;
    return this.set(speed);
  }

  medium(): TickerSpeed {
    const speed = TickerSpeed.Medium;
    return this.set(speed);
  }

  slow(): TickerSpeed {
    const speed = TickerSpeed.Slow;
    return this.set(speed);
  }

  set(speed: TickerSpeed): TickerSpeed {
    this.requests[speed] += 1;
    this._updateSpeed();

    return speed;
  }

  end(speed: TickerSpeed) {
    if (this.requests[speed] > 0) this.requests[speed] -= 1;
    this._updateSpeed();
  }

  update() {
    console.log('Ticker updated');
    this.ticker.update();
  }

  burst(ms = 500) {
    if (!this.isBurst) {
      console.log('Ticker burst');
      this.fast();
      this.isBurst = true;
      setTimeout(this._stopBurst.bind(this), ms);
    }
  }

  _stopBurst() {
    this.isBurst = false;
    this.end(TickerSpeed.Fast);
    console.log('Ticker burst done');
  }

  _chooseSpeed(): TickerSpeed {
    if (this.requests[TickerSpeed.Fast] > 0) {
      return TickerSpeed.Fast;
    } else if (this.requests[TickerSpeed.Medium] > 0) {
      return TickerSpeed.Medium;
    } else if (this.requests[TickerSpeed.Slow] > 0) {
      return TickerSpeed.Slow;
    }

    return TickerSpeed.Medium;
  }

  _speedToFPS(speed: TickerSpeed): number {
    if (speed === TickerSpeed.Fast) return this.fastFPS;
    if (speed === TickerSpeed.Medium) return this.mediumFPS;
    if (speed === TickerSpeed.Slow) return this.slowFPS;

    return this.mediumFPS;
  }

  _FPSToSpeed(FPS: number): TickerSpeed {
    if (FPS === this.fastFPS) return TickerSpeed.Fast;
    if (FPS === this.mediumFPS) return TickerSpeed.Medium;
    if (FPS === this.slowFPS) return TickerSpeed.Slow;

    return TickerSpeed.Medium;
  }

  _setFPS(FPS: number) {
    this.ticker.maxFPS = FPS;
    console.log('Ticker speed set to', FPS, 'FPS');
  }

  _updateSpeed() {
    const totRequests = Object.values(this.requests).reduce((a, b) => a + b, 0);
    if (!this.ticker.started && totRequests > 0) {
      this.ticker.start();
      console.log('Ticker started');
    } else if (this.ticker.started && totRequests === 0) {
      this.ticker.stop();
      console.log('Ticker stopped');
      return;
    }

    const speed = this._chooseSpeed();
    const FPS = this._speedToFPS(speed);
    this._setFPS(FPS);
  }
}

export default TickerManager;
export {TickerSpeed};
