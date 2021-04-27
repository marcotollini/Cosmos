import DatabaseInterface from '../DatabaseInterface';

import VPNList from './query/VPNList';
import BMPState from './query/BMPState';
import PeerUpState from './query/PeerUpState';
import {
  default as FilterBMPState,
  filtersType,
} from './query/Filter/FilterBMPState';
import FilterFieldsList from './query/Filter/FilterFieldsList';
import FilterFieldValues from './query/Filter/FilterFieldValues';
import FilterFieldsValues from './query/Filter/FilterFieldsValues';
import CountEvents from './query/CountEvents';
import VisualizationVPNTopology from './query/Visualization/VisualizationVPNTopology';
import VisualizationVPNRoutingTopology from './query/Visualization/VisualizationVPNRoutingTopology';
import VisualizationPeeringTopology from './query/Visualization/VisualizationPeeringTopology';
import VisualizationList from './query/Visualization/VisualizationList';

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

  PeerUpState(timestamp: Date): PeerUpState {
    return new PeerUpState(timestamp);
  }

  FilterFieldValues(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    fieldName: string
  ): FilterFieldValues {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    return new FilterFieldValues(filteredBmpState.raw(), fieldName);
  }

  FilterFieldsValues(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): FilterFieldsValues {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    console.log(filteredBmpState.raw());
    return new FilterFieldsValues(filteredBmpState.raw());
  }

  FilterFieldsList(timestamp: Date, vpn: string): FilterFieldsList {
    const bmpState = new BMPState(timestamp, vpn);
    return new FilterFieldsList(bmpState.raw());
  }

  CountEvents(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    approximation: boolean
  ): CountEvents {
    return new CountEvents(timestamp, vpn, filters, approximation);
  }

  VisualizationVPNTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationVPNTopology {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    return new VisualizationVPNTopology(filteredBmpState.raw());
  }

  VisualizationVPNRoutingTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationVPNRoutingTopology {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    return new VisualizationVPNRoutingTopology(filteredBmpState.raw());
  }

  VisualizationPeeringTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationPeeringTopology {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    return new VisualizationPeeringTopology(filteredBmpState.raw());
  }

  VisualizationList(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    show: string[]
  ): VisualizationList {
    const bmpState = new BMPState(timestamp, vpn);
    const filteredBmpState = new FilterBMPState(bmpState.raw(), filters);
    return new VisualizationList(filteredBmpState.raw(), show);
  }
}

export default PGDatabase;
