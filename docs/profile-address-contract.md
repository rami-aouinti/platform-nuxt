# Contrat Address (profil utilisateur)

Les endpoints `/api/v1/me/profile/addresses` (et alias `/api/me/profile/addresses`) normalisent désormais le contrat `Address` côté BFF.

## Champ de relation hiérarchique

- Le champ legacy `address` est remplacé par `parentAddressId`.
- La relation est exposée de manière typée via `parentAddress` avec la forme `{ id: string }`.
- Toute valeur legacy `address` reçue (string ou objet contenant `id`) est convertie en `parentAddressId`.

## Validations obligatoires (POST/PATCH)

Les champs suivants sont requis :

- `street`
- `city`
- `postalCode`
- `countryCode`

Si l'un de ces champs est absent ou vide, l'API renvoie une erreur `400 Invalid address payload`.
