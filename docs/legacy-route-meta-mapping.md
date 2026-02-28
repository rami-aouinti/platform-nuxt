# Mapping des routes legacy vers la meta Nuxt cible

Ce document centralise la convention utilisée pour `app/pages/legacy/**` afin d'éviter les divergences de `definePageMeta`.

## Règles de mapping

| Pattern route legacy | Layout Nuxt cible | Middleware | Flags meta | Convention SEO (`title`) |
| --- | --- | --- | --- | --- |
| `/legacy/Pages/Authentication/SignUp/*` | `auth` | `guest` | — | `Legacy · Authentication Sign Up <Page>` |
| `/legacy/Pages/Users/*` | `administration` | `['auth', 'admin-access']` | `requiresAuth: true`, `requiresAdmin: true` | `Legacy · Pages Users <Page>` |
| `/legacy/Pages/Profile*`, `/legacy/Pages/Account/*` | `default` | `['auth']` | `requiresAuth: true` | `Legacy · ...` |
| `/legacy/About` | `default` | — | — | `Legacy · About` |
| Toutes les autres pages legacy migrées (`Dashboard/*`, `Applications/*`, `Ecommerce/*`, `Tables/*`, `Pages/*`) | `administration` | `['auth']` | `requiresAuth: true` | `Legacy · ...` |

## Notes d'implémentation

- Toutes les pages legacy (hors widgets internes) ont désormais un `definePageMeta({...})` explicite.
- La convention de titre SEO minimale est normalisée via `title` dans `definePageMeta`.
- Si un changement de droits est requis pour une route legacy précise, mettre à jour ce document **et** la page concernée dans le même commit.

## Routes legacy couvertes

- `/legacy/About`
- `/legacy/Applications/Calendar`
- `/legacy/Applications/Datatables`
- `/legacy/Applications/Kanban`
- `/legacy/Applications/Wizard`
- `/legacy/Dashboard/Automotive`
- `/legacy/Dashboard/Calendar`
- `/legacy/Dashboard/Crm`
- `/legacy/Dashboard/Dashboard`
- `/legacy/Dashboard/Discover`
- `/legacy/Dashboard/GettingStarted`
- `/legacy/Dashboard/Sales`
- `/legacy/Dashboard/SmartHome`
- `/legacy/Dashboard/VrDefault`
- `/legacy/Dashboard/VrInfo`
- `/legacy/Ecommerce/Orders/OrderDetails`
- `/legacy/Ecommerce/Orders/OrderList`
- `/legacy/Ecommerce/Products/EditProduct`
- `/legacy/Ecommerce/Products/NewProduct`
- `/legacy/Ecommerce/Products/ProductPage`
- `/legacy/Pages/Account/Billing`
- `/legacy/Pages/Account/Invoice`
- `/legacy/Pages/Account/Settings`
- `/legacy/Pages/Alerts`
- `/legacy/Pages/Authentication/SignUp/Basic`
- `/legacy/Pages/Authentication/SignUp/Cover`
- `/legacy/Pages/Authentication/SignUp/Illustration`
- `/legacy/Pages/Charts`
- `/legacy/Pages/Notifications`
- `/legacy/Pages/Pricing`
- `/legacy/Pages/Profile`
- `/legacy/Pages/Profile/Messages`
- `/legacy/Pages/Profile/ProfileOverview`
- `/legacy/Pages/Profile/Projects`
- `/legacy/Pages/Projects/Timeline`
- `/legacy/Pages/Rtl`
- `/legacy/Pages/Timeline`
- `/legacy/Pages/Users/NewUser`
- `/legacy/Pages/Users/Reports`
- `/legacy/Tables/PaginatedTables`
- `/legacy/Tables/RegularTables`
- `/legacy/Tables/SortableTables`
