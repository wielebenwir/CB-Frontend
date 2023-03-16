import { MapDataAPI, ParsedMapConfiguration } from '../types';
import { ref, watchEffect } from 'vue';

type Fields = [keyof ParsedMapConfiguration, string][];

export class HTTPAPIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}

class MapConfigurationError extends Error {
  missingOrMisconfiguredFields: Fields;
  constructor(missingOrMisconfiguredFields: Fields) {
    const fieldString = missingOrMisconfiguredFields
      .map(([name, _type]) => `${name} (of type: ${_type})`)
      .join('\n');
    super(
      'The map configuration is missing some required fields or some of the fields have an invalid type.\n\n' +
        fieldString,
    );
    this.missingOrMisconfiguredFields = missingOrMisconfiguredFields;
  }

  static checkFields(configuration: ParsedMapConfiguration, fields: Fields) {
    const missingOrMisconfiguredFields = [];
    for (const field of fields) {
      const [fieldName, fieldType] = field;
      if (typeof configuration[fieldName] !== fieldType) {
        missingOrMisconfiguredFields.push(field);
      }
    }
    if (missingOrMisconfiguredFields.length > 0) {
      throw new MapConfigurationError(missingOrMisconfiguredFields);
    }
  }
}

async function createMapAPI(config: ParsedMapConfiguration): Promise<MapDataAPI> {
  const dataSource = config.dataSource ?? 'admin-ajax';

  if (dataSource === 'admin-ajax') {
    MapConfigurationError.checkFields(config, [
      ['dataUrl', 'string'],
      ['nonce', 'string'],
      ['cbMapId', 'number'],
    ]);

    const { API } = await import('./admin-ajax-api');
    return API({
      url: config.dataUrl,
      nonce: config.nonce,
      mapId: config.cbMapId,
    });
  }

  // TODO: test tree shaking of fixtures in library builds
  if (import.meta.env.DEV || import.meta.env.VITE_BUILD_MODE !== 'lib') {
    if (config.dataSource === 'fixtures') {
      const { API } = await import('./fixtures-api');
      return API();
    }
  }

  throw new TypeError('You’ve specified an unknown map data source configuration.');
}

export function useMapData(config: ParsedMapConfiguration) {
  const mapDataError = ref<Error>();
  const mapData = ref<MapDataAPI>();
  async function initAPI() {
    mapData.value = undefined;
    mapDataError.value = undefined;
    const api = await createMapAPI(config);
    try {
      await api.init();
      mapData.value = api;
    } catch (error) {
      mapDataError.value = error as Error;
    }
  }

  watchEffect(initAPI);

  return { mapData, mapDataError, retryMapAPI: initAPI };
}
