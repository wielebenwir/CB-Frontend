import { computed, ref, unref, watchEffect } from 'vue';
import { asyncIterableToArray } from '../../util';

type Locale = {
  key: string;
  language: string;
  translations: Record<string, string>;
};

const localeMap = Object.fromEntries(
  Object.entries(import.meta.glob('./*.json')).map(([filename, module]) => [
    (/([a-z]{2}(-[A-Z]{2})?).json/.exec(filename) as RegExpExecArray)[1],
    module,
  ]),
) as Record<string, () => Promise<Record<string, string>>>;

function getLanguage(locale: string) {
  const [language] = locale.split('-', 1);
  return language;
}

async function* findLocales(requestedLocales: string[]): AsyncIterable<Locale> {
  function createLocale(
    key: string,
    language: string,
    translations: Record<string, string>,
  ): Locale {
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

  function t(key: string) {
    for (const locale of locales.value) {
      if (locale.language !== language.value) {
        console.warn(`Missing ${language.value} translation for key '${key}'`);
      }
      if (typeof locale.translations[key] === 'string') {
        return locale.translations[key];
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
