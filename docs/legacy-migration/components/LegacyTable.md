# LegacyTable

Tableau générique pour migration progressive (simple/tri/recherche/pagination).

## Props
- `title: string` (requis)
- `headers: Array` (requis, format Vuetify `text/value`)
- `items: Array` (requis)
- `searchable?: boolean` (défaut `true`)
- `paginated?: boolean` (défaut `false`)
- `itemsPerPage?: number` (défaut `5`)
- `defaultSortBy?: string`
- `defaultSortDesc?: boolean`
- `searchPlaceholder?: string`

## Events
- Aucun.

## Slots
- `status` (`{ item }`) pour personnaliser la cellule status.
