import {
  VirtualRouter,
  StatePkt,
  UpgradePkt,
  EventCount,
} from 'cosmos-lib/src/types';

class Database {
  timeBetweenDumps: number;
  constructor() {
    this.timeBetweenDumps = 45 * 60;
    console.log('New database instance created');
  }

  async getDistinctVpn(timestamp: number): Promise<string[]> {
    throw new TypeError('Please implement abstract method.');
  }

  async getEventsCounter(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    throw new TypeError('Please implement abstract method.');
  }

  async getEventsCounterApprox(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    throw new TypeError('Please implement abstract method.');
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
