# LegacyNotificationsPanel

Panneau notifications + snackbar pour pages legacy.

## Props
- `items: Array` (requis, boutons de notifications)
- `snackbar: { visible: boolean, color: string | null }` (requis)

## Events
- `trigger(name: string)` au clic sur un bouton notification.
- `close()` fermeture via bouton croix.
- `update:visible(boolean)` sync d'ouverture/fermeture snackbar.

## Slots
- Aucun.
