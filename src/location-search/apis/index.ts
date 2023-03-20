import { LocationSearchAPI, ParsedLocationSearchConfiguration } from '../types';
import { ref, watchEffect } from 'vue';

type Fields = [keyof ParsedLocationSearchConfiguration, string][];

export class HTTPAPIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}

class LocationSearchConfigurationError extends Error {
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

  static checkFields(configuration: ParsedLocationSearchConfiguration, fields: Fields) {
    const missingOrMisconfiguredFields = [];
    for (const field of fields) {
      const [fieldName, fieldType] = field;
      if (typeof configuration[fieldName] !== fieldType) {
        missingOrMisconfiguredFields.push(field);
      }
    }
    if (missingOrMisconfiguredFields.length > 0) {
      throw new LocationSearchConfigurationError(missingOrMisconfiguredFields);
    }
  }
}

async function createMapAPI(config: ParsedLocationSearchConfiguration): Promise<LocationSearchAPI> {
  const dataSource = config.dataSource ?? 'admin-ajax';

  if (dataSource === 'admin-ajax') {
    LocationSearchConfigurationError.checkFields(config, [
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

export function useLocationSearchData(config: ParsedLocationSearchConfiguration) {
  const error = ref<Error>();
  const data = ref<LocationSearchAPI>();
  async function initAPI() {
    data.value = undefined;
    error.value = undefined;
    const api = await createMapAPI(config);
    try {
      await api.init();
      data.value = api;
    } catch (_error) {
      error.value = _error as Error;
    }
  }

  watchEffect(initAPI);

  return { data, error, retry: initAPI };
}
