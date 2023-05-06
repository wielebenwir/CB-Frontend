import { addDays, formatISO } from 'date-fns';
import type {
  APIAvailabilityStatus,
  APIDay,
  APIItem,
  APILocation,
} from '../../apis/admin-ajax-api';
import assets from './assets';

let id = 0;

const images = [
  'ArCgAeF5_Wk',
  'thYXxn9quVw',
  'wSoO8iNYtoU',
  '0ClfreiNppM',
  '6tK2Og9dEKA',
  'uVUTQb-7idQ',
  '9AFUBP9kIUU',
  'hPgLl59hbqE',
  'W5dou7Qo2D8',
  'xG3gqmai_7k',
  'tNTvX60SN4o',
  'FzA40q6nDiA',
  'cnZ9VRtJPH8',
  'XCaOgRaGA0Q',
  'zi8mg1ShblI',
  'GmMTa8Mjngg',
  '6ffbx9gM5_g',
  'bHLU1KnjzbQ',
  'eZJiq4IVlwY',
  'EnKMpZcq0M4',
  'IlR3M0BMrWQ',
  '6FgbPqag3h8',
  'sh0GVkpEUXk',
  'sNW-qKWO7xk',
  'SHU4YVhTth8',
];

const usedImages = new Set<string>();
const usedNames = new Set<string>();

export function makeList<T>(size: number, createFn: (index?: number) => T): T[] {
  return Array.from(Array(size)).map((_, index) => createFn(index));
}

function randomFloatInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(iterable: T[]): T {
  const randomIndex = Math.floor(Math.random() * iterable.length);
  return iterable[randomIndex];
}

function randomSubset<T>(list: T[], count: number): T[] {
  const subset = new Set<T>();
  while (subset.size < count) {
    subset.add(randomChoice(list));
  }
  return Array.from(subset);
}

function cycleChoice<T>(list: T[], cache: Set<T>) {
  if (list.length === cache.size) {
    cache.clear();
  }
  const remaining = list.filter((item) => !cache.has(item));
  const choice = randomChoice(remaining);
  cache.add(choice);
  return choice;
}

function joinRandomizedWords(choiceLists: string[][]) {
  return choiceLists
    .map((choices) => randomChoice(choices))
    .reduce((string, token) => {
      return ['.', '?', '!', ','].includes(token[0])
        ? string.trim() + token.trim()
        : `${string.trim()} ${token.trim()}`.trim();
    }, '')
    .trim();
}

/* cspell:disable */
function generateRandomItemName() {
  return cycleChoice(
    [
      'Helge',
      'Buxi',
      'Ede',
      'Jule',
      'Jascha',
      'Moosmutzel',
      'Benni',
      'Kalle',
      'Ingrid',
      'Gudrun',
      'Flunder',
      'Jockel',
      'Bärbel',
      'Rakete',
    ],
    usedNames,
  );
}

function generateRandomItemDescription(name: string) {
  return joinRandomizedWords([
    [name],
    ['ist ein'],
    ['robustes', 'tragfähiges', 'kompaktes', 'weichmütiges', 'elegantes', 'funkelndes'],
    ['Provisorium', 'Dreirad', 'Zweirad', 'Einrad', 'Lastenrad'],
    ['mit', 'ohne'],
    ['Elektroantrieb', 'Kettenschaltung', 'Bremsen', 'Laufradklingel', 'Düsenantrieb'],
    [', das sich'],
    [
      'ohne Not',
      'mit viel Glück',
      'in Lichtgeschwindigkeit',
      'im Handumdrehen',
      'bei Gelegenheit',
      'in Zukunft',
    ],
    [
      'vorwärts bewegt',
      'im Kreis dreht',
      'in Luft auflöst',
      'aus dem Staub macht',
      'reparieren lässt',
      'einklappen lässt',
      'tieferlegen lässt',
      'zu einem Transformer verwandelt',
      'zu einem Cabrio verwandelt',
      'zur Schnecke macht',
      'in Gedanken verliert',
    ],
    ['.'],
  ]);
}

function generateLocationName() {
  return joinRandomizedWords([
    ['Kinder und Jugend', 'Klemmbaustein', 'Kunst', 'Hunde', 'Gurken', 'Knurrende', ''],
    ['Post', 'Schule', 'Schwimmhalle', 'Bäckerei', 'Anstalt'],
  ]);
}

function generateStreet() {
  return (
    joinRandomizedWords([
      ['Neue', 'Alte', 'An der', ''],
      ['Bahnhof', 'Friedhof', 'Kuckuck', 'Kirschbaum', 'Esel', 'Teich', 'Kloster'],
      ['Gasse', 'Straße', 'Allee', 'Schule', 'Kreuzung'],
    ]) +
    ' ' +
    randomIntInRange(1, 150)
  );
}
/* cspell:enable */

function generateRandomImages(): Record<string, [string, number, number, boolean]> {
  const imageId = cycleChoice(images, usedImages);
  const baseUrl = `https://source.unsplash.com/${imageId}/`;

  return {
    thumbnail: [`${baseUrl}/150x150/`, 150, 150, true],
    medium: [`${baseUrl}/300x200/`, 300, 200, true],
    large: [`${baseUrl}/640x426/`, 640, 426, true],
    full: [`${baseUrl}/1200x800/`, 1200, 800, true],
  };
}
function* generateAvailability(
  firstSlotState?: APIAvailabilityStatus,
  choices: { status: APIAvailabilityStatus; probability: number }[] = [
    { status: 'available', probability: 0.5 },
    { status: 'booked', probability: 0.3 },
    { status: 'partially-booked', probability: 0.15 },
    { status: 'locked', probability: 0.1 },
  ],
  days = 31,
) {
  function pickStatus() {
    let _status: APIAvailabilityStatus = 'available';
    let _chance = 0;
    for (const { status, probability } of choices) {
      const chance = Math.random() * probability;
      if (chance > _chance) {
        _chance = chance;
        _status = status;
      }
    }
    return _status;
  }

  let today = new Date();
  for (const [index] of Array(days).entries()) {
    const state = index === 0 ? firstSlotState ?? pickStatus() : pickStatus();
    yield {
      date: today.toISOString().split('T')[0],
      status: state,
    };
    today = addDays(today, 1);
  }
}

function* generateRandomDays(chance = 0.05) {
  for (const [index] of Array(6).entries()) {
    if (Math.random() < chance) {
      yield (index + 1).toString() as APIDay;
    }
  }
}

function generateRandomItem(): APIItem {
  const name = generateRandomItemName();
  return {
    name,
    id: `fake-id-${id++}`,
    short_desc: generateRandomItemDescription(name),
    link: `https://example.org/items/${encodeURIComponent(name)}`,
    status: 'publish',
    terms: randomSubset([27, 28, 29, 30, 31, 32, 33, 34, 35], randomIntInRange(0, 4)),
    timeframes: [
      {
        date_start: formatISO(new Date(), { representation: 'date' }),
        date_end: '2999-12-31',
      },
    ],
    availability: Array.from(generateAvailability()),
    thumbnail: null,
    images: generateRandomImages(),
  };
}

export function generateRandomLocation(): APILocation {
  const name = generateLocationName();
  return {
    // Somewhere in Cologne.
    lat: randomFloatInRange(50.8755, 50.9885),
    lon: randomFloatInRange(6.8572, 7.102),
    closed_days: Array.from(generateRandomDays()),
    location_name: name,
    address: {
      street: generateStreet(),
      city: 'Köln',
      zip: randomIntInRange(50667, 51149).toString(),
    },
    location_link: `https://example.org/locations/${encodeURIComponent(name)}`,
    items: makeList(randomIntInRange(1, 3), generateRandomItem),
  };
}

export default [
  {
    lat: 50.950757300000006,
    lon: 7.0075453020128311,
    location_name: 'Buchforst Mobil',
    location_link: 'https://stage3.commons-booking.org/schöneorte/station-fuer-bubi/',
    closed_days: [],
    address: {
      street: 'Herschelstr. 3',
      city: 'Köln',
      zip: '51065',
    },
    items: [
      {
        id: 10524,
        name: 'Bubi',
        short_desc:
          'Bubi hat zwar keinen Motor, aber eine große Kiste mit Platz für 4 Kinder oder jede Menge Gepäck.',
        status: 'publish',
        terms: [28, 34, 30, 31],
        link: 'https://stage3.commons-booking.org/rundedinge/bubi-2/?cb-location=10510',
        thumbnail: assets['bubi-150x150.jpg'],
        images: {
          thumbnail: [assets['bubi-150x150.jpg'], 150, 150, true],
          medium: [assets['bubi-300x216.jpg'], 300, 216, true],
          large: [assets['bubi-1024x737.jpg'], 640, 461, true],
          full: [assets['bubi-1920x1382.jpg'], 1920, 1382, false],
        },
        timeframes: [
          {
            date_start: '2021-12-19',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
      {
        id: 10227123,
        name: 'Fuchur',
        short_desc:
          'Dieser abschließbare fliegende Hund ist ideal geeignet um lange Strecken in hoher Geschwindigkeit zu überbrücken.',
        status: 'publish',
        terms: [28, 34, 30, 31],
        link: 'https://stage3.commons-booking.org/rundedinge/by-2/?cb-location=10510',
        thumbnail: assets['fuchur-150x150.jpg'],
        images: {
          thumbnail: [assets['fuchur-150x150.jpg'], 150, 150, true],
          medium: [assets['fuchur-300x200.jpg'], 300, 200, true],
          large: [assets['fuchur-640x427.jpg'], 640, 427, true],
          full: [assets['fuchur-1600x1067.jpg'], 1600, 1067, true],
        },
        timeframes: [
          {
            date_start: '2021-12-19',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
  {
    lat: 50.941415406105776,
    lon: 6.9359619465236433,
    location_name: 'Alnatura Belgisches Viertel',
    location_link: 'https://stage3.commons-booking.org/schöneorte/alnatura-belgisches-viertel/',
    closed_days: [],
    address: {
      street: 'Bismarckstraße 27-29',
      city: 'Köln',
      zip: '50672',
    },
    items: [
      {
        id: 12261,
        name: 'Artikel mit zwei Slots',
        short_desc: '',
        status: 'publish',
        terms: [],
        link: 'https://stage3.commons-booking.org/rundedinge/artikel-mit-zwei-slots/?cb-location=10220',
        thumbnail: null,
        images: { thumbnail: false, medium: false, large: false, full: false },
        timeframes: [
          {
            date_start: '2022-04-01',
            date_end: '2999-01-01',
          },
          {
            date_start: '2022-04-01',
            date_end: '2999-01-01',
          },
          {
            date_start: '2021-12-29',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
  {
    lat: 50.873500800000002,
    lon: 6.9963717000000001,
    location_name: 'Tafel Köln e. V.',
    location_link: 'https://stage3.commons-booking.org/schöneorte/tafel-koeln-e-v/',
    closed_days: [],
    address: {
      street: 'Kirschbaumweg 18A',
      city: 'Köln-Rodenkirchen',
      zip: '50996',
    },
    items: [
      {
        id: 7660,
        name: 'TAFELino',
        short_desc: 'TAFELino ist riesig und stark.',
        status: 'publish',
        terms: [28, 29],
        link: 'https://stage3.commons-booking.org/rundedinge/tafelino/?cb-location=7658',
        thumbnail: assets['tafelino-150x150.jpg'],
        images: {
          thumbnail: [assets['tafelino-150x150.jpg'], 150, 150, true],
          medium: [assets['tafelino-300x169.jpg'], 300, 169, true],
          large: [assets['tafelino-1024x577.jpg'], 640, 361, true],
          full: [assets['tafelino-800x451.jpg'], 800, 451, false],
        },
        timeframes: [
          {
            date_start: '2021-02-01',
            date_end: '2999-01-01',
          },
          {
            date_start: '2021-02-01',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
  {
    lat: 50.980089399999997,
    lon: 6.8667236999999997,
    location_name: 'Bürgerschaftshaus Bocklemünd-Mengenich e.V.',
    location_link:
      'https://stage3.commons-booking.org/schöneorte/buergerschaftshaus-bocklemuend-mengenich-e-v/',
    closed_days: ['6', '7'],
    address: {
      street: 'Görlinger-Zentrum 11-15',
      city: 'Köln',
      zip: '50829',
    },
    items: [
      {
        id: 3636,
        name: 'Bockes Bike',
        short_desc:
          'E-Lastenrad Urban Arrow Cargo L mit Flightcase L, Ausleihe nur nach vorheriger Probefahrt!',
        status: 'publish',
        terms: [27, 31, 29],
        link: 'https://stage3.commons-booking.org/rundedinge/koelner-elf-nn-1/?cb-location=3596',
        thumbnail: assets['bockes-bike-150x150.jpg'],
        images: {
          thumbnail: [assets['bockes-bike-150x150.jpg'], 150, 150, true],
          medium: [assets['bockes-bike-300x194.jpg'], 300, 194, true],
          large: [assets['bockes-bike-1024x661.jpg'], 640, 413, true],
          full: [assets['bockes-bike-2560x1654.jpg'], 2560, 1654, false],
        },
        timeframes: [
          {
            date_start: '2020-08-14',
            date_end: '1601424000',
          },
          {
            date_start: '2020-10-28',
            date_end: '1608595200',
          },
          {
            date_start: '2021-02-09',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
  {
    lat: 50.951644700000003,
    lon: 6.9223891999999996,
    location_name: 'Bei Flo',
    location_link: 'https://stage3.commons-booking.org/schöneorte/bei-flo/',
    closed_days: [],
    address: {
      street: 'Glasstr',
      city: 'Köln',
      zip: '50823',
    },
    items: [
      {
        id: 3634,
        name: 'Ayline',
        short_desc:
          'Das E-Lastenrad CargoBike Long Steps ist für Kinder- und Lastentransporte gut geeignet.',
        status: 'publish',
        terms: [27, 34, 29],
        link: 'https://stage3.commons-booking.org/rundedinge/e-lastenrad-buergerzentrum-vingst/?cb-location=3619',
        thumbnail: assets['ayline-150x150.jpg'],
        images: {
          thumbnail: [assets['ayline-150x150.jpg'], 150, 150, true],
          medium: [assets['ayline-300x192.jpg'], 300, 192, true],
          large: [assets['ayline-1024x654.jpg'], 640, 409, true],
          full: [assets['ayline-2560x1635.jpg'], 2560, 1635, false],
        },
        timeframes: [
          {
            date_start: '2022-04-10',
            date_end: '2999-01-01',
          },
          {
            date_start: '2022-04-14',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
  {
    lat: 50.929355000000001,
    lon: 6.9255645090794999,
    location_name: 'bei Anna',
    location_link: 'https://stage3.commons-booking.org/schöneorte/bei-anna/',
    closed_days: [],
    address: {
      street: 'Eckertstr. 6',
      city: 'Köln',
      zip: '50931',
    },
    items: [
      {
        id: 3645,
        name: 'Madomobil',
        short_desc:
          'Das MADOMOBIL hat drei Räder und vorne eine Kiste mit viel Platz für alles Mögliche. Zum Beispiel können im MADOMOBIL bis zu vier Kinder (ca. 2 bis 6 Jahre) angeschnallt werden. (weitere Details auf der Buchungsseite)',
        status: 'publish',
        terms: [28, 34, 32, 30],
        link: 'https://stage3.commons-booking.org/rundedinge/madomobil/?cb-location=3625',
        thumbnail: assets['madomobil-150x150.jpg'],
        images: {
          thumbnail: [assets['madomobil-150x150.jpg'], 150, 150, true],
          medium: [assets['madomobil-300x200.jpg'], 300, 200, true],
          large: [assets['madomobil-1024x683.jpg'], 640, 427, true],
          full: [assets['madomobil-1024x683.jpg'], 1024, 683, false],
        },
        timeframes: [
          {
            date_start: '2021-01-16',
            date_end: '1611100800',
          },
          {
            date_start: '2022-02-01',
            date_end: '2999-01-01',
          },
        ],
        availability: Array.from(generateAvailability()),
      },
    ],
  },
] as APILocation[];
