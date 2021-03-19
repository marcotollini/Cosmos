import {Knex} from 'knex';
import {BMPDump, BMPEvent} from './types';

class Database {
  constructor() {
    console.log('New database instance created');
  }

  distinctVPNDump(timestamp: number, vpn: string): Knex.QueryBuilder {
    throw new TypeError('Please implement abstract method.');
  }

  distinctVpnEvent(timestamp: number, vpn: string): Knex.QueryBuilder {
    throw new TypeError('Please implement abstract method.');
  }

  stateVrfVpnDump(
    table_name: string,
    timestamp: number,
    vpn: string
  ): Knex.QueryBuilder {
    throw new TypeError('Please implement abstract method.');
  }

  stateVrfVpnEvent(
    table_name: string,
    timestamp: number,
    vpn: string
  ): Knex.QueryBuilder {
    throw new TypeError('Please implement abstract method.');
  }

  async stateVpn(
    timestamp: number,
    vpn: string
  ): Promise<[BMPDump[], BMPEvent[]]> {
    throw new TypeError('Please implement abstract method.');
  }
}

export default Database;
