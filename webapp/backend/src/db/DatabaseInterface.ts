import VPNListInterface from './query-interface/VPNList';
import BMPStateInterface from './query-interface/BMPState';
import FilterFieldsListInterface from './query-interface/Filter/FilterFieldsList';
import FilterFieldValuesInterface from './query-interface/Filter/FilterFieldValues';
import FilterFieldsValuesInterface from './query-interface/Filter/FilterFieldsValues';
import VisualizationVPNTopologyInterface from './query-interface/Visualization/VisualizationVPNTopology';

interface DatabaseInterface {
  VPNList(timestamp: Date): VPNListInterface;

  BMPState(timestamp: Date, vpn: string): BMPStateInterface;

  FilterFieldsList(timestamp: Date, vpn: string): FilterFieldsListInterface;

  FilterFieldValues(
    timestamp: Date,
    vpn: string,
    fieldName: string
  ): FilterFieldValuesInterface;

  FilterFieldsValues(timestamp: Date, vpn: string): FilterFieldsValuesInterface;

  VisualizationVPNTopology(
    timestamp: Date,
    vpn: string
  ): VisualizationVPNTopologyInterface;
}

export default DatabaseInterface;
