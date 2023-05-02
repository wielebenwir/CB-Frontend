import { ref, Ref, watchEffect } from 'vue';
import {
  Common,
  CommonLocation,
  CustomIcon,
  IconWrapper,
  CommonMarkerIconConfig,
  MarkerIconConfig,
  CommonMarkerIconRenderer,
} from '../types';
import marker from '../../assets/map-marker-2.svg';
import MapMarkerTemplate from '../../assets/map-marker-template.svg?raw';
import { createImageResolver, iterSettled } from '../../util';

export type MarkerIcon = {
  iconUrl: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  className: string;
};

type PointOfInterest = {
  markerIcon: MarkerIcon;
  common: Common;
  location: CommonLocation;
};

const defaultImageResolver = createImageResolver();

const traditionalIcon: MarkerIcon = {
  iconUrl: marker,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  className: 'cb-map-marker--type-icon cb-map-marker--type-traditional-icon',
};

const defaultCommonMarkerRenderers: CommonMarkerIconRenderer[] = [
  { type: 'thumbnail' },
  { type: 'color', color: 'var(--commonsbooking-map-marker-default-embed-fill)' },
];

function defaults<T>(...args: (T | undefined)[]) {
  return Object.assign({}, ...args.map((arg) => arg ?? {}));
}

function getNodeSelector(node: Element) {
  const classes = String(node.classList);
  const attrs = Array.from(node.attributes)
    .filter((a) => a.name !== 'class')
    .map((a) => `[${a.name}="${a.value}"]`)
    .join('');
  return `${node.nodeName.toLowerCase()}${attrs}${classes ? '.' + classes : ''}`;
}

function resolveColor(
  color: string | undefined,
  defaultValue: string | undefined = undefined,
  root?: Element,
) {
  const _color = color ?? defaultValue;
  if (!_color) return _color;
  const match = /^var\(\s*(--[^,)]+)(?:,\s*(.+))?\s*\)$/.exec(_color);
  if (match) {
    const _root = root ?? document.querySelector('.cb-map') ?? document.documentElement;
    const cssProperty = match[1] as string;
    const cssPropertyDefault = match[2] as string;
    const resolvedColor = getComputedStyle(_root).getPropertyValue(cssProperty).trim();

    if (resolvedColor) {
      return resolvedColor;
    } else {
      if (!cssPropertyDefault) {
        console.warn(
          `Could not find CSS property '${cssProperty}' on node ${getNodeSelector(_root)}.`,
        );
        return defaultValue;
      }
      return cssPropertyDefault;
    }
  } else {
    return _color;
  }
}

export function makeMapMarkerIcon(
  imageUrl: string | undefined,
  rendererTypes: string[],
  config?: IconWrapper | undefined,
): MarkerIcon {
  const template = config?.template ?? {
    source: MapMarkerTemplate,
    width: 60,
    height: 70,
    anchor: { x: 0.5, y: 1 },
  };
  const scale = config?.scale ?? 1;
  const fill = resolveColor(config?.fill) ?? '#fff';
  const embedFill = resolveColor(config?.embedFill) ?? fill;
  const width = template.width * scale;
  const height = template.height * scale;
  const x = width * template.anchor.x;
  const y = height * template.anchor.y;
  const svg = template.source
    .replaceAll(/\s*\n\s*/g, ' ')
    .replaceAll('__WIDTH__', width.toString())
    .replaceAll('__HEIGHT__', height.toString())
    .replaceAll('__FILL_COLOR__', fill)
    .replaceAll('__EMBED_FILL_COLOR__', embedFill)
    .replaceAll('__EMBED_URL__', imageUrl ?? '');
  return {
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [width, height],
    iconAnchor: [x, y],
    className: rendererTypes.map((type) => `cb-map-marker--type-${type}`).join(' '),
  };
}

function customIconToMapMarkerIcon(icon: CustomIcon): MarkerIcon {
  const { width, height } = icon;
  return {
    iconUrl: icon.url,
    iconSize: [width, height],
    iconAnchor: [width * icon.anchor.x, height * icon.anchor.y],
    className: 'cb-map-marker--type-icon',
  };
}

async function _resolveMarkerIcon(
  config: MarkerIconConfig | undefined,
  defaultValue?: MarkerIcon,
  baseRendererTypes: string[] = [],
  resolveURL: (url: string) => Promise<string | undefined> = defaultImageResolver,
): Promise<MarkerIcon> {
  const renderers = config?.renderers ?? [];

  for (const renderer of renderers) {
    if (renderer.type === 'image') {
      const url = await resolveURL(renderer.url);
      if (!url) continue;
      const wrapConf = defaults(config?.wrapDefaults, renderer?.wrap);
      return makeMapMarkerIcon(url, [...baseRendererTypes, 'image'], wrapConf);
    }

    if (renderer.type === 'color') {
      const color = resolveColor(renderer.color);
      if (!color) continue;
      const wrapConf = defaults(config?.wrapDefaults, renderer?.wrap, {
        embedFill: color,
      });
      return makeMapMarkerIcon(undefined, [...baseRendererTypes, 'color'], wrapConf);
    }

    if (renderer.type === 'icon') {
      return customIconToMapMarkerIcon(renderer);
    }

    if (renderer.type === 'traditional-icon') {
      return traditionalIcon;
    }
  }

  return (
    defaultValue ??
    makeMapMarkerIcon(undefined, ['color'], {
      embedFill: 'var(--commonsbooking-map-marker-default-embed-fill)',
    })
  );
}

export async function resolveMarkerIcon(
  config: MarkerIconConfig | undefined,
  defaultValue?: MarkerIcon,
  resolveURL: (url: string) => Promise<string | undefined> = defaultImageResolver,
) {
  return _resolveMarkerIcon(config, defaultValue, [], resolveURL);
}

async function resolveCommonMarkerIcon(
  common: Common,
  config: CommonMarkerIconConfig | undefined,
  resolveURL: (url: string) => Promise<string | undefined> = defaultImageResolver,
): Promise<MarkerIcon> {
  const renderers = config?.renderers ?? defaultCommonMarkerRenderers;

  for (const renderer of renderers) {
    if (renderer.type === 'thumbnail') {
      if (common.images.length === 0) {
        continue;
      }
      const image = common.images.find((i) => i.width === i.height) ?? common.images[0];
      const url = await resolveURL(image.url);
      if (!url) continue;
      const wrapConf = defaults(config?.wrapDefaults, renderer?.wrap);
      return makeMapMarkerIcon(url, ['thumbnail', 'image'], wrapConf);
    }

    if (renderer.type === 'category') {
      for (const matcher of renderer.match) {
        if (!matcher.categories.every((id) => common.categoryIds.includes(id))) continue;
        return await _resolveMarkerIcon(
          {
            renderers: Array.isArray(matcher.renderers) ? matcher.renderers : [matcher.renderers],
            wrapDefaults: defaults(config?.wrapDefaults, renderer?.wrap, matcher?.wrap),
          },
          undefined,
          ['category'],
        );
      }
    }
  }

  // We already handled all special types, so it’s safe to cast it as MarkerConfig.
  return await resolveMarkerIcon(config as MarkerIconConfig, undefined, resolveURL);
}

type POIEventHandlers = {
  onDelete?: (id: Common['id']) => void;
  onSet?: (id: Common['id']) => void;
};

export function usePointsOfInterest(
  commons: Ref<Common[]>,
  locationMap: Ref<Map<CommonLocation['id'], CommonLocation>>,
  { onDelete, onSet }: POIEventHandlers = {},
  markerIconConfig: CommonMarkerIconConfig | undefined,
  resolveImage: (url: string) => Promise<string | undefined> = defaultImageResolver,
) {
  let lastUpdate = new Date();
  const pointsOfInterest = ref(new Map<Common['id'], PointOfInterest>());

  async function createPointOfInterest(common: Common): Promise<PointOfInterest> {
    const location = locationMap.value.get(common.locationId) as CommonLocation;
    const markerIcon = await resolveCommonMarkerIcon(common, markerIconConfig, resolveImage);
    return { common, location, markerIcon };
  }

  watchEffect(async () => {
    const updateInitiatedAt = new Date();
    lastUpdate = updateInitiatedAt;

    // first handle commons no longer in our list
    const newCommonIds = new Set(commons.value.map(({ id }) => id));
    for (const commonId of pointsOfInterest.value.keys()) {
      if (!newCommonIds.has(commonId)) {
        pointsOfInterest.value.delete(commonId);
        onDelete?.(commonId);
      }
    }

    // now handle all new commons in the list
    const newCommons = commons.value.filter((c) => !pointsOfInterest.value.has(c.id));
    const newPointsOfInterest = newCommons.map(createPointOfInterest);
    for await (const data of iterSettled(newPointsOfInterest)) {
      if (data.status === 'rejected') {
        console.error('Could not create POI from common', data.reason);
        continue;
      }

      // Using an async function in watchEffect entails that we have to
      // manually check if we should still modify state. If another effect
      // was scheduled lastUpdate will have changed, so we know that we
      // should stop processing here and now.
      if (lastUpdate.getTime() !== updateInitiatedAt.getTime()) {
        break;
      }
      const id = data.value.common.id;
      pointsOfInterest.value.set(id, data.value);
      onSet?.(id);
    }
  });

  return pointsOfInterest;
}
