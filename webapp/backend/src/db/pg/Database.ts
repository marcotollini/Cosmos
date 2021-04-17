import DatabaseInterface from '../DatabaseInterface';
import VPNList from './query/VPNList';
import BMPState from './query/BMPState';

class PGDatabase extends DatabaseInterface {
  constructor() {
    super();
  }

  VPNList(timestamp: Date): VPNList {
    return new VPNList(timestamp);
  }

  BMPState(timestamp: Date, vpn: string): BMPState {
    console.log('stat', BMPState);
    return new BMPState(timestamp, vpn);
  }
}

export default PGDatabase;
