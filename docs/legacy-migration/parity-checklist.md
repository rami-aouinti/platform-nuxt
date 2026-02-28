# Checklist de parité des pages legacy migrées

Cette checklist est **obligatoire pour chaque page migrée** avant activation de la redirection `/legacy/**` vers la nouvelle route Nuxt.

## Modèle par page

- Legacy route:
- Nouvelle route:
- Domaine:
- MIG ticket:
- UX ticket:
- Date validation:

### 1) Navigation
- [ ] Tous les liens internes pointent vers la nouvelle route.
- [ ] Les breadcrumbs, menus et CTA ouvrent la bonne destination.
- [ ] Le bouton retour conserve le comportement attendu (historique / route fallback).

### 2) Formulaires
- [ ] Les champs visibles et obligatoires sont identiques.
- [ ] Les validations (messages, formats, états erreur/succès) sont équivalentes.
- [ ] Les actions submit/cancel/reset reproduisent le comportement legacy.

### 3) Tableaux
- [ ] Colonnes, tri, filtres, pagination et états vides sont conformes.
- [ ] Les actions de ligne (voir, éditer, supprimer, export) restent disponibles.
- [ ] Les performances restent acceptables sur un dataset représentatif.

### 4) i18n
- [ ] Tous les libellés passent par les clés de traduction.
- [ ] Les messages d'erreur et toasts sont traduits.
- [ ] Les formats de date/nombre sont cohérents selon la locale.

### 5) Responsive
- [ ] Desktop (>=1280px), tablette (~768px) et mobile (~390px) sont validés.
- [ ] Aucun débordement horizontal sur formulaires/tableaux.
- [ ] Les actions critiques restent accessibles sans hover.

### 6) Permissions
- [ ] La route est protégée par le middleware/guard attendu.
- [ ] Les éléments d'UI conditionnels respectent les rôles.
- [ ] Les API appelées côté page ne divulguent pas de données hors permissions.

## Règle d'activation des redirections

Une route ne peut être ajoutée dans `app/utils/legacy-migration/validatedRedirects.ts` que si les 6 sections sont cochées et que le ticket UX est validé.
