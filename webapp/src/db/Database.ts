import {Knex} from 'knex';

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

  async stateVpn(timestamp: number, vpn: string) {
    throw new TypeError('Please implement abstract method.');
  }
}

export default Database;
