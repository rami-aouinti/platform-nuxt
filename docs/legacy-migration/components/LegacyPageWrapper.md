# LegacyPageWrapper

Wrapper de layout pour pages auth/dashboard/profile en migration.

## Props
- `fluid?: boolean` (défaut `true`)
- `containerClass?: string` (défaut `px-6 py-6`)
- `rowClass?: string` (défaut `md-page-section`)
- `contentClass?: string` (défaut `mx-auto`)
- `cols?: number|string` (défaut `12`)
- `md?: number|string` (défaut `8`)
- `lg?: number|string|null`

## Events
- Aucun.

## Slots
- `default` contenu principal de page.


## Notes de migration
- Le composant applique désormais `md-page` sur le conteneur pour homogénéiser le shell visuel des pages legacy migrées progressivement.
