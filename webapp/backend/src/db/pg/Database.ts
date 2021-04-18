import DatabaseInterface from '../DatabaseInterface';
import VPNList from './query/VPNList';
import BMPState from './query/BMPState';
import FilterFieldsList from './query/Filter/FilterFieldsList';
import FilterFieldValues from './query/FilterFieldValues';
import VisualizationVPNTopology from './query/Visualization/VisualizationVPNTopology';

class PGDatabase extends DatabaseInterface {
  constructor() {
    super();
  }

  VPNList(timestamp: Date): VPNList {
    return new VPNList(timestamp);
  }

  BMPState(timestamp: Date, vpn: string): BMPState {
    return new BMPState(timestamp, vpn);
  }

  BMPStateFilterFieldsList(timestamp: Date, vpn: string): FilterFieldsList {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldsList(bmpState.raw());
  }

  BMPStateFilterFieldValues(
    timestamp: Date,
    vpn: string,
    fieldName: string
  ): FilterFieldValues {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldValues(bmpState.raw(), fieldName);
  }

  BMPStateVisualizationVPNTopology(
    timestamp: Date,
    vpn: string
  ): VisualizationVPNTopology {
    const bmpState = new BMPState(timestamp, vpn);
    return new VisualizationVPNTopology(bmpState.raw());
  }
}

export default PGDatabase;
