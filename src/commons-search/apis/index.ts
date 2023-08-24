import { CommonsSearchAPI } from '../types';
import { ref, watchEffect } from 'vue';

type Fields<T = Record<string, unknown>> = [keyof T, string][];

export class HTTPAPIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}

export class ConfigurationError<T> extends Error {
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
      throw new ConfigurationError(missingOrMisconfiguredFields);
    }
  }
}

export function useCommonsSearchAPI(api_: CommonsSearchAPI) {
  const apiError = ref<Error>();
  const api = ref<CommonsSearchAPI>(api_);
  async function initAPI() {
    apiError.value = undefined;
    try {
      await api_.init();
    } catch (error) {
      apiError.value = error as Error;
    }
  }

  watchEffect(initAPI);

  return { api, apiError, retryAPI: initAPI };
}
