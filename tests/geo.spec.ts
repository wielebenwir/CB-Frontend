import { describe, it } from 'vitest';
import geoLocations from '../src/commons-search/fixtures/nominatim-locations.json';
import {
  filterNeighboringNominatimResults,
  processNominatimResults,
} from '../src/commons-search/geo';

describe('Geo Processing', () => {
  it('Removes locations within the same radius', ({ expect }) => {
    const filteredLocations = filterNeighboringNominatimResults(geoLocations, 30);
    expect(filteredLocations).toHaveLength(5);
    expect(new Set(filteredLocations.map((l) => l.place_id))).toMatchObject(
      new Set([128653283, 121406860, 131037899, 138170337, 183278239]),
    );
  });

  it('Transforms nominatim results to a proper format', ({ expect }) => {
    const transformedLocations = processNominatimResults(geoLocations);
    expect(transformedLocations).toMatchObject([
      {
        id: 121406860,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 10963 Berlin',
        lat: 52.49616905,
        lng: 13.383691449143502,
      },
      {
        id: 128653283,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 12107 Berlin',
        lat: 52.4373229,
        lng: 13.380380114995281,
      },
      {
        id: 45309641,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 10963 Berlin',
        lat: 52.4961021,
        lng: 13.3841179,
      },
      {
        id: 131037899,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 70499 Stuttgart, Baden-Württemberg',
        lat: 48.817545100000004,
        lng: 9.114430650703174,
      },
      {
        id: 66522418,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 14482 Potsdam, Brandenburg',
        lat: 52.38927,
        lng: 13.0925936,
      },
      {
        id: 138170337,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 14482 Potsdam, Brandenburg',
        lat: 52.3892158,
        lng: 13.09257804770648,
      },
      {
        id: 183278239,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21, 16548 Oberhavel, Brandenburg',
        lat: 52.6311988,
        lng: 13.345392282982456,
      },
      {
        id: 66286013,
        // cspell:disable-next-line
        name: 'Großbeerenstraße 21a, 14482 Potsdam, Brandenburg',
        lat: 52.3892409,
        lng: 13.0927318,
      },
    ]);
  });
});
