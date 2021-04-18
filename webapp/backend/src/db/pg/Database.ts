import DatabaseInterface from '../DatabaseInterface';

import VPNList from './query/VPNList';
import BMPState from './query/BMPState';
import FilterFieldsList from './query/Filter/FilterFieldsList';
import FilterFieldValues from './query/Filter/FilterFieldValues';
import FilterFieldsValues from './query/Filter/FilterFieldsValues';
import VisualizationVPNTopology from './query/Visualization/VisualizationVPNTopology';

class PGDatabase implements DatabaseInterface {
  constructor() {
    console.log('New Postgres DB created');
  }

  VPNList(timestamp: Date): VPNList {
    return new VPNList(timestamp);
  }

  BMPState(timestamp: Date, vpn: string): BMPState {
    return new BMPState(timestamp, vpn);
  }

  FilterFieldValues(
    timestamp: Date,
    vpn: string,
    fieldName: string
  ): FilterFieldValues {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldValues(bmpState.raw(), fieldName);
  }

  FilterFieldsValues(timestamp: Date, vpn: string): FilterFieldsValues {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldsValues(bmpState.raw());
  }

  FilterFieldsList(timestamp: Date, vpn: string): FilterFieldsList {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldsList(bmpState.raw());
  }

  VisualizationVPNTopology(
    timestamp: Date,
    vpn: string
  ): VisualizationVPNTopology {
    const bmpState = new BMPState(timestamp, vpn);
    return new VisualizationVPNTopology(bmpState.raw());
  }
}

export default PGDatabase;
