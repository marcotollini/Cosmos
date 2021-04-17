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

  BMPStateFilterFieldsList(timestamp: Date, vpn: string): QueryInterface {
    throw new TypeError('Please implement abstract method.');
  }

  BMPStateFilterFieldValues(
    timestamp: Date,
    vpn: string,
    fieldName: string
  ): QueryInterface {
    throw new TypeError('Please implement abstract method.');
  }

  BMPStateVisualizationVPNTopology(
    timestamp: Date,
    vpn: string
  ): QueryInterface {
    throw new TypeError('Please implement abstract method.');
  }
}

export default DatabaseInterface;
