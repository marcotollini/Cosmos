import VPNListInterface from './query-interface/VPNList';
import BMPStateInterface from './query-interface/BMPState';
import {filtersType} from './query-interface/Filter/FilterBMPState';
import FilterFieldsListInterface from './query-interface/Filter/FilterFieldsList';
import FilterFieldValuesInterface from './query-interface/Filter/FilterFieldValues';
import FilterFieldsValuesInterface from './query-interface/Filter/FilterFieldsValues';
import VisualizationVPNTopologyInterface from './query-interface/Visualization/VisualizationVPNTopology';
import VisualizationListInterface from './query-interface/Visualization/VisualizationList';

interface DatabaseInterface {
  VPNList(timestamp: Date): VPNListInterface;

  BMPState(timestamp: Date, vpn: string): BMPStateInterface;

  FilterFieldsList(timestamp: Date, vpn: string): FilterFieldsListInterface;

  FilterFieldValues(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    fieldName: string
  ): FilterFieldValuesInterface;

  FilterFieldsValues(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): FilterFieldsValuesInterface;

  VisualizationVPNTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationVPNTopologyInterface;

  VisualizationList(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    show: string[]
  ): VisualizationListInterface;
}

export default DatabaseInterface;
