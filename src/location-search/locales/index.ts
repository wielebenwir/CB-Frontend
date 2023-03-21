import { computed, ref, unref, watchEffect } from 'vue';
import { asyncIterableToArray } from '../../util';

interface Translations {
  [k: string]: string | Translations;
}

type Locale = {
  key: string;
  language: string;
  translations: Translations;
};

const localeMap = Object.fromEntries(
  Object.entries(import.meta.glob('./*.json')).map(([filename, module]) => [
    (/([a-z]{2}(-[A-Z]{2})?).json/.exec(filename) as RegExpExecArray)[1],
    module,
  ]),
) as Record<string, () => Promise<Translations>>;

function getLanguage(locale: string) {
  const [language] = locale.split('-', 1);
  return language;
}

async function* findLocales(requestedLocales: string[]): AsyncIterable<Locale> {
  function createLocale(key: string, language: string, translations: Translations): Locale {
    return {
      key,
      language,
      translations,
    };
  }

  for (const locale of requestedLocales) {
    const language = getLanguage(locale);
    if (localeMap[locale]) {
      yield createLocale(locale, language, await localeMap[locale]());
    }
    if (localeMap[language]) {
      yield createLocale(language, language, await localeMap[language]());
    }
  }
}

export function useI18n() {
  const locale = ref<string>('de');
  const fallbackLocales = ref<string[]>(['en']);
  const language = computed(() => getLanguage(locale.value));
  const locales = ref<Locale[]>([]);

  function findKey(keys: string[], translations: Translations): string | undefined {
    const [key, ...rest] = keys;
    if (!key) return;
    const value = translations[key];
    if (rest.length === 0 && typeof value === 'string') {
      return value;
    } else if (rest.length > 0 && typeof value === 'object') {
      return findKey(rest, value);
    } else {
      return undefined;
    }
  }

  function t(key: string) {
    for (const locale of locales.value) {
      if (locale.language !== language.value) {
        console.warn(`Missing ${language.value} translation for key '${key}'`);
      }
      const translation = findKey(key.split('.'), locale.translations);
      if (typeof translation === 'string') {
        return translation;
      }
    }
    return '! UNTRANSLATED !';
  }

  watchEffect(async () => {
    const requestedLocales = [unref(locale), ...unref(fallbackLocales)];
    locales.value = await asyncIterableToArray(findLocales(requestedLocales));
  });

  return {
    locale,
    fallbackLocales,
    language,
    t,
  };
}
