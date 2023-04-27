# Configuration

## Map Marker Icons

The CB-Frontend library comes with a powerful map marker icon generation utility
which makes it easy to create custom icons for your map.

These marker icon generation utilities are called renderers. You can define multiple renderers
in your configuration. If a renderer cannot yield an icon for a common, the next renderer in
your configuration is used as a fallback. For instance the _thumbnail_ renderer can only yield
an icon if an image has been assigned to a common.

See the examples and the reference below.

### Examples

#### Category Icons and Thumbnails

This configuration example

1. first tries to match certain categories
2. if no category has a match, the thumbnail is used
3. if the common has no thumbnail, a static color is used

```json5
{
  map: {
    markerIcon: {
      renderers: [
        {
          type: 'category',
          match: [
            {
              categories: [6, 8],
              renderers: [{ type: 'image', url: '/assets/kasten-elektrisch.png' }],
            },
            { categories: [6], renderers: [{ type: 'image', url: '/assets/elektrisch.png' }] },
            { categories: [8], renderers: [{ type: 'image', url: '/assets/kasten.png' }] },
            { categories: [12], renderers: [{ type: 'image', url: '/assets/3-raeder.png' }] },
            { categories: [16], renderers: [{ type: 'color', color: 'teal' }] },
          ],
        },
        { type: 'thumbnail' },
        { type: 'color', color: 'hsl(20 60% 80%)' },
      ],
    },
  },
}
```

#### Traditional map marker

This configuration example simply uses the standard map marker icon we’re all used to.

```json5
{
  map: {
    markerIcon: {
      renderers: [{ type: 'traditional-icon' }],
    },
  },
}
```

#### Custom map marker icon

This configuration example uses a custom map marker icon.

```json5
{
  map: {
    markerIcon: {
      renderers: [
        {
          type: 'icon',
          url: '/assets/my-custom-icon.png',
          width: 25,
          height: 40,
          anchor: { x: 0.5, y: 1 },
        },
      ],
    },
  },
}
```

### Renderer Reference

#### Color

Renders a static color inside a map marker.

```json5
{ type: 'color', color: '#cc0000' }
```

#### Image

Renders a static image inside a map marker.

```json5
{ type: 'image', url: '/assets/my-image.jpg' }
```

#### Icon

Renders a custom icon.

```json5
{
  type: 'icon',
  url: '/assets/my-icon.png',
  width: 25,
  height: 40,
  anchor: { x: 0.5, y: 1 },
}
```

#### Traditional Icon

Renders a traditional map marker icon shipped with the CB-Frontend library.

```json5
{ type: 'traditional-icon' }
```

#### Thumbnail

Renders the common’s thumbnail image inside a map marker.
Does not work as user marker icon.

```json5
{ type: 'thumbnail' }
```

#### Category

Checks if all the category ids match for the given common and renders the appropriate marker.
The first match wins. Does not work as user marker icon.

```json5
{
  type: 'category',
  match: [
    { categories: [1, 2, 3], renderers: [{ type: 'color', color: 'green' }] },
    { categories: [2], renderers: [{ type: 'color', color: 'hsl(90 60% 80%)' }] },
  ],
}
```

### Icon Envelope

The _color_, _image_, and _thumbnail_ renderer all use the same "envelope" icon.
This envelope is also configurable. All the mentioned renderer types, as well as the
_category_ renderer, and the individual category match instances support the `wrap`
attribute that takes a configuration object.

This object looks like this (all keys are optional):

```json5
{
  // The color of the envelope itself.
  fill: '#fff',
  // The background color of the circle that embeds the content.
  // You might want to change this, if you want to use an image renderer
  // with a transparent image background.
  embedFill: 'yellow',
  // A number that scales the icon proportionally.
  scale: 0.5,
  // An SVG image string is used for creating icons.
  // This must NOT be a path, but the actual SVG string.
  // See: /src/assets/map-marker-template.svg
  template: '...',
}
```

You can also modify the envelope globally by using the `wrapDefaults` property.

In the following example we half the size of the envelope and change its color,
but increase the size by a factor of 5, if a thumbnail is rendered.

```json5
{
  map: {
    markerIcon: {
      wrapDefaults: { scale: 0.5, fill: '#eaeaea' },
      renderers: [
        { type: 'thumbnail', wrap: { scale: 5 } },
        { type: 'color', color: 'hsl(20 60% 80%)' },
      ],
    },
  },
}
```

#### User location icon

The `markerIcon` property is only used for the commons on the map.
If you want to change the icon for the user’s location on the map you
must set the `userMarkerIcon` property instead. All renderer types are supported
except for _thumbnail_ and _category_.
