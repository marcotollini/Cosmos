import QueryInterface from './QueryInterface';

class DatabaseInterface {
  constructor() {
    console.log('New database instance created');
  }

  VPNList(timestamp: Date): QueryInterface {
    throw new TypeError('Please implement abstract method.');
  }

  BMPState(timestamp: Date, vpn: string): QueryInterface {
    throw new TypeError('Please implement abstract method.');
  }
}

export default DatabaseInterface;
