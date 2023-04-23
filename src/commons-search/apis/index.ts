import { AdminAjaxDataSource, CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import { ref, watchEffect } from 'vue';

type Fields<T = Record<string, unknown>> = [keyof T, string][];

export class HTTPAPIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}

class CommonsSearchConfigurationError<T> extends Error {
  missingOrMisconfiguredFields: Fields<T>;
  constructor(missingOrMisconfiguredFields: Fields<T>) {
    const fieldString = missingOrMisconfiguredFields
      .map(([name, _type]) => `${String(name)} (of type: ${_type})`)
      .join('\n');
    super(
      'The commons search configuration is missing some required fields or some of the fields have an invalid type.\n\n' +
        fieldString,
    );
    this.missingOrMisconfiguredFields = missingOrMisconfiguredFields;
  }

  static checkFields<T>(configuration: T, fields: Fields<T>) {
    const missingOrMisconfiguredFields = [];
    for (const field of fields) {
      const [fieldName, fieldType] = field;
      if (typeof configuration[fieldName] !== fieldType) {
        missingOrMisconfiguredFields.push(field);
      }
    }
    if (missingOrMisconfiguredFields.length > 0) {
      throw new CommonsSearchConfigurationError(missingOrMisconfiguredFields);
    }
  }
}

async function createCommonsSearchAPI(
  config: CommonsSearchConfiguration,
): Promise<CommonsSearchAPI> {
  const dataSource = config.dataSource;

  if (dataSource.type === 'admin-ajax') {
    CommonsSearchConfigurationError.checkFields<AdminAjaxDataSource>(dataSource, [
      ['url', 'string'],
      ['nonce', 'string'],
      ['mapId', 'number'],
    ]);

    const { API } = await import('./admin-ajax-api');
    return API(dataSource, config);
  }

  if (import.meta.env.VITE_BUILD_MODE === 'app') {
    if (dataSource.type === 'fixtures') {
      const { API } = await import('./fixtures-api');
      return API(config);
    }
  }

  throw new TypeError(
    'You’ve specified an unknown data source in your commons search configuration.',
  );
}

export function useCommonsSearchAPI(config: CommonsSearchConfiguration) {
  const apiError = ref<Error>();
  const api = ref<CommonsSearchAPI>();
  async function initAPI() {
    api.value = undefined;
    apiError.value = undefined;
    const _api = await createCommonsSearchAPI(config);
    try {
      await _api.init();
      api.value = _api;
    } catch (error) {
      apiError.value = error as Error;
    }
  }

  watchEffect(initAPI);

  return { api, apiError, retryAPI: initAPI };
}
