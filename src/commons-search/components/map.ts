import marker from '../../assets/map-marker-2.svg';
import { ParsedCommonsSearchConfiguration } from '../types';

export type MarkerIcon = {
  iconUrl: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
};

export function getTileServerUrl(tileServerIndex: number) {
  return [
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
    'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
    'https://tiles.lokaler.de/osmbright-20171212/{z}/{x}/{y}/tile@1x.jpeg',
  ][tileServerIndex];
}

export function getAttribution(config: ParsedCommonsSearchConfiguration) {
  let attribution =
    'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors - <a href="https://www.openstreetmap.org/copyright">License</a>';
  if (config.showLocationDistanceFilter) {
    attribution +=
      ' | Address search by <a href="https://nominatim.openstreetmap.org/">Nominatim</a>';
  }
  return attribution;
}

export const defaultIcon: MarkerIcon = {
  iconUrl: marker,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
};
