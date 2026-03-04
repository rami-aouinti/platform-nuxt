# Plan de migration visuelle legacy

## 1) Inventaire des pages legacy actives

- Point d’entrée analysé: `app/pages/legacy/**`.
- Filtrage routing appliqué via `pages:extend` dans `nuxt.config.ts`: exclusion des routes internes `Components`, `Layout`, `Tables/Tables`, `Widgets`.
- `routeRules` ne redirige pas `/legacy/**` actuellement (seulement `/jobs` et `/administration`).
- Total de pages legacy actives exposées au router: **82**.

### Répartition rapide

- `About`: 1 page(s)
- `Applications`: 6 page(s)
- `Dashboard`: 27 page(s)
- `Ecommerce`: 8 page(s)
- `Pages`: 38 page(s)
- `Tables`: 2 page(s)

### Liste des routes legacy actives

- `/legacy/About`
- `/legacy/Applications/Calendar`
- `/legacy/Applications/Datatables`
- `/legacy/Applications/Kanban`
- `/legacy/Applications/Widgets/CalendarWidget`
- `/legacy/Applications/Widgets/DatatableSearch`
- `/legacy/Applications/Widgets/DatatableSimple`
- `/legacy/Dashboard/Calendar`
- `/legacy/Dashboard/Crm`
- `/legacy/Dashboard/Dashboard`
- `/legacy/Dashboard/Discover`
- `/legacy/Dashboard/GettingStarted`
- `/legacy/Dashboard/Sales`
- `/legacy/Dashboard/SmartHome`
- `/legacy/Dashboard/VrDefault`
- `/legacy/Dashboard/VrInfo`
- `/legacy/Dashboard/Widgets/Calendar`
- `/legacy/Dashboard/Widgets/CardChartChannels`
- `/legacy/Dashboard/Widgets/CardChartRevenue`
- `/legacy/Dashboard/Widgets/CardChartSalesAge`
- `/legacy/Dashboard/Widgets/CardCompletedTasks`
- `/legacy/Dashboard/Widgets/CardDailySales`
- `/legacy/Dashboard/Widgets/CardWebsiteViews`
- `/legacy/Dashboard/Widgets/CategoriesCard`
- `/legacy/Dashboard/Widgets/CheckTogglesTable`
- `/legacy/Dashboard/Widgets/DarkTable`
- `/legacy/Dashboard/Widgets/LightTablePagination`
- `/legacy/Dashboard/Widgets/LightTableTransparent`
- `/legacy/Dashboard/Widgets/MembersCard`
- `/legacy/Dashboard/Widgets/MembersCardSearch`
- `/legacy/Dashboard/Widgets/SalesCountry`
- `/legacy/Dashboard/Widgets/TableInlineActions`
- `/legacy/Dashboard/Widgets/TableInlineActionsStriped`
- `/legacy/Dashboard/Widgets/VectorMapCard`
- `/legacy/Ecommerce/Orders/OrderDetails`
- `/legacy/Ecommerce/Orders/Widgets/TableOrders`
- `/legacy/Ecommerce/Products/EditProduct`
- `/legacy/Ecommerce/Products/NewProduct`
- `/legacy/Ecommerce/Products/ProductPage`
- `/legacy/Ecommerce/Products/Widgets/Dropzone`
- `/legacy/Ecommerce/Products/Widgets/HtmlEditor`
- `/legacy/Ecommerce/Products/Widgets/TableProducts`
- `/legacy/Pages/Account/Invoice`
- `/legacy/Pages/Account/Settings`
- `/legacy/Pages/Account/Widgets/Accounts`
- `/legacy/Pages/Account/Widgets/BasicInfo`
- `/legacy/Pages/Account/Widgets/ChangePassword`
- `/legacy/Pages/Account/Widgets/DeleteAccount`
- `/legacy/Pages/Account/Widgets/Notifications`
- `/legacy/Pages/Account/Widgets/Sessions`
- `/legacy/Pages/Account/Widgets/TwoFactor`
- `/legacy/Pages/Alerts`
- `/legacy/Pages/Authentication/SignUp/Basic`
- `/legacy/Pages/Authentication/SignUp/Cover`
- `/legacy/Pages/Authentication/SignUp/Illustration`
- `/legacy/Pages/Charts`
- `/legacy/Pages/Notifications`
- `/legacy/Pages/Pricing`
- `/legacy/Pages/Profile/Messages`
- `/legacy/Pages/Profile/ProfileOverview`
- `/legacy/Pages/Profile/Projects`
- `/legacy/Pages/Profile`
- `/legacy/Pages/Projects/Timeline`
- `/legacy/Pages/Rtl`
- `/legacy/Pages/Timeline`
- `/legacy/Pages/Users/NewUser`
- `/legacy/Pages/Users/Reports`
- `/legacy/Pages/Users/Widgets/ReportsTable`
- `/legacy/Pages/Widgets/BarChart`
- `/legacy/Pages/Widgets/BarChartHorizontal`
- `/legacy/Pages/Widgets/BubbleChart`
- `/legacy/Pages/Widgets/CategoriesCard`
- `/legacy/Pages/Widgets/CategoriesCardDashboard`
- `/legacy/Pages/Widgets/DoughnutChart`
- `/legacy/Pages/Widgets/LineChart`
- `/legacy/Pages/Widgets/LineChartWithoutDots`
- `/legacy/Pages/Widgets/MixedChart`
- `/legacy/Pages/Widgets/PieChart`
- `/legacy/Pages/Widgets/PolarChart`
- `/legacy/Pages/Widgets/RadarChart`
- `/legacy/Tables/PaginatedTables`
- `/legacy/Tables/SortableTables`

## 2) Wrapper visuel unique

- `LegacyPageWrapper` devient le point d’entrée standard pour injecter les classes globales Material Dashboard: `md-page` + `md-page-section`.
- La prop `rowClass` permet de conserver de la flexibilité page par page sans dupliquer le shell.
- Les pages peuvent conserver leur markup métier pendant la migration progressive.

## 3) Priorisation et migration structurelle (lot courant)

Priorité définie sur les écrans les plus susceptibles d’être consultés en navigation quotidienne (dashboard + tables):

1. `/legacy/Dashboard/Dashboard`
2. `/legacy/Dashboard/Sales`
3. `/legacy/Tables/SortableTables`
4. `/legacy/Tables/PaginatedTables`

Actions réalisées dans ce lot:

- Adoption du shell `md-page` sur Dashboard/Sales.
- Ajout de `md-card-elevated` sur les cartes principales Dashboard/Sales pour homogénéiser relief, bordure et rayon.
- Bascule des pages Tables vers `LegacyPageWrapper` pour standardiser immédiatement l’enveloppe visuelle.

## 4) Checklist de conformité visuelle

- [ ] **Espacement**: paddings de page conformes (`md-page`), rythmes verticaux entre sections (`md-page-section`).
- [ ] **Typographie**: hiérarchie titres/sous-titres cohérente (`text-h*`, poids, casse), pas de tailles inline non tokenisées.
- [ ] **Cards**: cartes interactives/metrics avec `md-card-elevated` (rayon, ombre, bordure, surface).
- [ ] **Actions**: boutons principaux/secondaires alignés sur les variantes globales, rayons harmonisés dans le scope `.md-page`.
- [ ] **Contrastes**: ratio lisible sur fonds dégradés, badges, alertes et textes secondaires.
- [ ] **Responsive**: rendu validé mobile/tablette/desktop (grilles, retours ligne CTA, densité tables).

## 5) Plan de suppression des styles legacy redondants

1. **Mesure**: lister les classes legacy encore utilisées (`card-shadow`, `border-radius-xl`, marges utilitaires historiques) par page migrée.
2. **Substitution**: remplacer par classes globales (`md-card-elevated`, `md-page*`) et utilitaires Vuetify standards.
3. **Nettoyage progressif**: supprimer d’abord les règles non référencées dans les pages migrées uniquement.
4. **Validation**: capture visuelle + revue UX avant suppression globale d’un bloc de styles.
5. **Retrait final**: quand les routes legacy restantes sont migrées, purger les styles legacy résiduels dans `assets/styles/material-dashboard/**`.
