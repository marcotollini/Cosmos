import DatabaseInterface from '../DatabaseInterface';
import VPNList from './query/VPNList';

class PGDatabase extends DatabaseInterface {
  constructor() {
    super();
  }

  VPNList(timestamp: Date): VPNList {
    return new VPNList(timestamp);
  }
}

export default PGDatabase;
