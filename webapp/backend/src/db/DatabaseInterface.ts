import VPNListInterface from './query-interface/VPNList';
import BMPStateInterface from './query-interface/BMPState';
import {filtersType} from './query-interface/Filter/FilterBMPState';
import FilterFieldsListInterface from './query-interface/Filter/FilterFieldsList';
import FilterFieldValuesInterface from './query-interface/Filter/FilterFieldValues';
import FilterFieldsValuesInterface from './query-interface/Filter/FilterFieldsValues';
import CountEventsInterface from './query-interface/CountEvents';
import VisualizationVPNTopologyInterface from './query-interface/Visualization/VisualizationVPNTopology';
import VisualizationVPNRoutingTopologyInterface from './query-interface/Visualization/VisualizationVPNRoutingTopology';
import VisualizationPeeringTopologyInterface from './query-interface/Visualization/VisualizationPeeringTopology';
import VisualizationListInterface from './query-interface/Visualization/VisualizationList';
import PeerUpStateInterface from './query-interface/PeerUpState';
import QuerySaveInterface from './query-interface/QuerySave';
import QueryGetInterface from './query-interface/QueryGet';

interface DatabaseInterface {
  VPNList(timestamp: Date): VPNListInterface;

  BMPState(timestamp: Date, vpn: string): BMPStateInterface;

  PeerUpState(timestamp: Date): PeerUpStateInterface;

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

  CountEvents(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    approximation: boolean
  ): CountEventsInterface;

  VisualizationVPNTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationVPNTopologyInterface;

  VisualizationVPNRoutingTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationVPNRoutingTopologyInterface;

  VisualizationPeeringTopology(
    timestamp: Date,
    vpn: string,
    filters: filtersType
  ): VisualizationPeeringTopologyInterface;

  VisualizationList(
    timestamp: Date,
    vpn: string,
    filters: filtersType,
    show: string[]
  ): VisualizationListInterface;

  QuerySave(payload: {[key: string]: any}): QuerySaveInterface;

  QueryGet(id: string): QueryGetInterface;
}

export default DatabaseInterface;
