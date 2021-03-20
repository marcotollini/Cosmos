import {StatePkt, UpgradePkt} from './types';

class Database {
  timeBetweenDumps: number;
  constructor() {
    this.timeBetweenDumps = 45 * 60;
    console.log('New database instance created');
  }

  async getBMPState(vpn: string, timestamp: number): Promise<StatePkt> {
    throw new TypeError('Please implement abstract method.');
  }

  async getBMPUpgrade(
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ): Promise<UpgradePkt> {
    throw new TypeError('Please implement abstract method.');
  }
}

export default Database;
