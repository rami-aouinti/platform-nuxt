# Legacy migration backlog

Generated from `app/pages/legacy/**/*.vue`.

## Conventions de destination

- Déplacer les pages vers `app/pages/<domain>/...` en supprimant le préfixe `legacy`.
- Normaliser les chemins de destination en kebab-case.
- Mettre à jour la colonne `migration_status` (`not started`, `in progress`, `done`) et `migration_flag` (`pending`, `migrated`).
- `migration_ticket` couvre la migration technique, `ux_validation_ticket` couvre la validation UX post-migration.
- Renseigner la [checklist de parité](./parity-checklist.md) (navigation, formulaires, tableaux, i18n, responsive, permissions) pour chaque page migrée.
- Ajouter/mettre à jour les tests ciblés par domaine dans `test/nuxt` et `test/e2e` avant de marquer une route comme validée.
- Activer la redirection de la route legacy uniquement après validation UX dans `app/utils/legacy-migration/validatedRedirects.ts`.

## Redirections HTTP

- Utiliser **302** pendant la phase de migration tant que la nouvelle route n'est pas validée.
- Basculer en **301** quand la route Nuxt 4 est en production et validée UX.
- Retirer les redirections temporaires une fois les liens internes mis à jour.

## Classification par catégorie (source de vérité: ce backlog)

- **À rediriger**: routes migrées + validées UX (`État migration = done`, `Migration flag = migrated`).
- **À migrer**: routes encore actives en legacy (`not started` / `in progress`).
- **À supprimer**: aucune route backlog dans ce lot (catégorie conservée et réévaluée à chaque lot).

### Lots courts fermés (un domaine à la fois)

| Lot | Domaine | Route traitée | Catégorie finale | Statut lot |
| --- | --- | --- | --- | --- |
| LOT-DASH-01 | Dashboard | /legacy/Dashboard/Automotive | à rediriger | fermé |
| LOT-PAGES-01 | Pages | /legacy/Pages/Account/Billing | à rediriger | fermé |
| LOT-ECOM-01 | Ecommerce | /legacy/Ecommerce/Orders/OrderList | à rediriger | fermé |
| LOT-APPS-01 | Applications | /legacy/Applications/Wizard | à rediriger | fermé |
| LOT-TABLES-01 | Tables | /legacy/Tables/RegularTables | à rediriger | fermé |
| LOT-LAYOUT-01 | Layout | /legacy/Layout/PageLayout | à rediriger | fermé |
| LOT-COMP-01 | Components | /legacy/Components/Notifications | à rediriger | fermé |

## Dashboard

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Dashboard/Automotive | Dashboard | none | done | /dashboard/automotive | MIG-0010 | UX-0010 | migrated |
| /legacy/Dashboard/Calendar | Dashboard | @fullcalendar/daygrid; @fullcalendar/interaction; @fullcalendar/timegrid; @fullcalendar/vue | not started | /dashboard/calendar | MIG-0011 | UX-0011 | pending |
| /legacy/Dashboard/Crm | Dashboard | none | not started | /dashboard/crm | MIG-0012 | UX-0012 | pending |
| /legacy/Dashboard/Dashboard | Dashboard | none | not started | /dashboard/dashboard | MIG-0013 | UX-0013 | pending |
| /legacy/Dashboard/Discover | Dashboard | none | not started | /dashboard/discover | MIG-0014 | UX-0014 | pending |
| /legacy/Dashboard/GettingStarted | Dashboard | none | not started | /dashboard/getting-started | MIG-0015 | UX-0015 | pending |
| /legacy/Dashboard/Sales | Dashboard | none | not started | /dashboard/sales | MIG-0016 | UX-0016 | pending |
| /legacy/Dashboard/SmartHome | Dashboard | none | not started | /dashboard/smart-home | MIG-0017 | UX-0017 | pending |
| /legacy/Dashboard/VrDefault | Dashboard | none | not started | /dashboard/vr-default | MIG-0018 | UX-0018 | pending |
| /legacy/Dashboard/VrInfo | Dashboard | none | not started | /dashboard/vr-info | MIG-0019 | UX-0019 | pending |
| /legacy/Dashboard/Widgets/Calendar | Dashboard | @fullcalendar/daygrid; @fullcalendar/interaction; @fullcalendar/timegrid; @fullcalendar/vue | not started | /dashboard/widgets/calendar | MIG-0020 | UX-0020 | pending |
| /legacy/Dashboard/Widgets/CardChartChannels | Dashboard | none | not started | /dashboard/widgets/card-chart-channels | MIG-0021 | UX-0021 | pending |
| /legacy/Dashboard/Widgets/CardChartRevenue | Dashboard | none | not started | /dashboard/widgets/card-chart-revenue | MIG-0022 | UX-0022 | pending |
| /legacy/Dashboard/Widgets/CardChartSalesAge | Dashboard | none | not started | /dashboard/widgets/card-chart-sales-age | MIG-0023 | UX-0023 | pending |
| /legacy/Dashboard/Widgets/CardCompletedTasks | Dashboard | none | not started | /dashboard/widgets/card-completed-tasks | MIG-0024 | UX-0024 | pending |
| /legacy/Dashboard/Widgets/CardDailySales | Dashboard | none | not started | /dashboard/widgets/card-daily-sales | MIG-0025 | UX-0025 | pending |
| /legacy/Dashboard/Widgets/CardWebsiteViews | Dashboard | none | not started | /dashboard/widgets/card-website-views | MIG-0026 | UX-0026 | pending |
| /legacy/Dashboard/Widgets/CategoriesCard | Dashboard | none | not started | /dashboard/widgets/categories-card | MIG-0027 | UX-0027 | pending |
| /legacy/Dashboard/Widgets/MembersCard | Dashboard | none | not started | /dashboard/widgets/members-card | MIG-0028 | UX-0028 | pending |
| /legacy/Dashboard/Widgets/MembersCardSearch | Dashboard | none | not started | /dashboard/widgets/members-card-search | MIG-0029 | UX-0029 | pending |
| /legacy/Dashboard/Widgets/SalesCountry | Dashboard | none | not started | /dashboard/widgets/sales-country | MIG-0030 | UX-0030 | pending |
| /legacy/Dashboard/Widgets/VectorMapCard | Dashboard | @/components/WorldMap/WorldMap.vue | not started | /dashboard/widgets/vector-map-card | MIG-0031 | UX-0031 | pending |

## Pages

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Pages/Account/Billing | Pages | none | done | /pages/account/billing | MIG-0048 | UX-0048 | migrated |
| /legacy/Pages/Account/Invoice | Pages | none | not started | /pages/account/invoice | MIG-0049 | UX-0049 | pending |
| /legacy/Pages/Account/Settings | Pages | none | not started | /pages/account/settings | MIG-0050 | UX-0050 | pending |
| /legacy/Pages/Account/Widgets/Accounts | Pages | none | not started | /pages/account/widgets/accounts | MIG-0051 | UX-0051 | pending |
| /legacy/Pages/Account/Widgets/BasicInfo | Pages | none | not started | /pages/account/widgets/basic-info | MIG-0052 | UX-0052 | pending |
| /legacy/Pages/Account/Widgets/ChangePassword | Pages | none | not started | /pages/account/widgets/change-password | MIG-0053 | UX-0053 | pending |
| /legacy/Pages/Account/Widgets/DeleteAccount | Pages | none | not started | /pages/account/widgets/delete-account | MIG-0054 | UX-0054 | pending |
| /legacy/Pages/Account/Widgets/Notifications | Pages | none | not started | /pages/account/widgets/notifications | MIG-0055 | UX-0055 | pending |
| /legacy/Pages/Account/Widgets/Sessions | Pages | none | not started | /pages/account/widgets/sessions | MIG-0056 | UX-0056 | pending |
| /legacy/Pages/Account/Widgets/TwoFactor | Pages | none | not started | /pages/account/widgets/two-factor | MIG-0057 | UX-0057 | pending |
| /legacy/Pages/Alerts | Pages | none | not started | /pages/alerts | MIG-0058 | UX-0058 | pending |
| /legacy/Pages/Authentication/SignUp/Basic | Pages | none | not started | /pages/authentication/sign-up/basic | MIG-0059 | UX-0059 | pending |
| /legacy/Pages/Authentication/SignUp/Cover | Pages | none | not started | /pages/authentication/sign-up/cover | MIG-0060 | UX-0060 | pending |
| /legacy/Pages/Authentication/SignUp/Illustration | Pages | none | not started | /pages/authentication/sign-up/illustration | MIG-0061 | UX-0061 | pending |
| /legacy/Pages/Charts | Pages | none | not started | /pages/charts | MIG-0062 | UX-0062 | pending |
| /legacy/Pages/Notifications | Pages | none | not started | /pages/notifications | MIG-0063 | UX-0063 | pending |
| /legacy/Pages/Pricing | Pages | none | not started | /pages/pricing | MIG-0064 | UX-0064 | pending |
| /legacy/Pages/Profile | Pages | none | not started | /pages/profile | MIG-0065 | UX-0065 | pending |
| /legacy/Pages/Profile/Messages | Pages | none | not started | /pages/profile/messages | MIG-0066 | UX-0066 | pending |
| /legacy/Pages/Profile/ProfileOverview | Pages | none | not started | /pages/profile/profile-overview | MIG-0067 | UX-0067 | pending |
| /legacy/Pages/Profile/Projects | Pages | none | not started | /pages/profile/projects | MIG-0068 | UX-0068 | pending |
| /legacy/Pages/Projects/Timeline | Pages | none | not started | /pages/projects/timeline | MIG-0069 | UX-0069 | pending |
| /legacy/Pages/Rtl | Pages | none | not started | /pages/rtl | MIG-0070 | UX-0070 | pending |
| /legacy/Pages/Timeline | Pages | none | not started | /pages/timeline | MIG-0071 | UX-0071 | pending |
| /legacy/Pages/Users/NewUser | Pages | none | not started | /pages/users/new-user | MIG-0072 | UX-0072 | pending |
| /legacy/Pages/Users/Reports | Pages | none | not started | /pages/users/reports | MIG-0073 | UX-0073 | pending |
| /legacy/Pages/Users/Widgets/ReportsTable | Pages | none | not started | /pages/users/widgets/reports-table | MIG-0074 | UX-0074 | pending |
| /legacy/Pages/Widgets/BarChart | Pages | none | not started | /pages/widgets/bar-chart | MIG-0075 | UX-0075 | pending |
| /legacy/Pages/Widgets/BarChartHorizontal | Pages | none | not started | /pages/widgets/bar-chart-horizontal | MIG-0076 | UX-0076 | pending |
| /legacy/Pages/Widgets/BubbleChart | Pages | none | not started | /pages/widgets/bubble-chart | MIG-0077 | UX-0077 | pending |
| /legacy/Pages/Widgets/CategoriesCard | Pages | none | not started | /pages/widgets/categories-card | MIG-0078 | UX-0078 | pending |
| /legacy/Pages/Widgets/CategoriesCardDashboard | Pages | none | not started | /pages/widgets/categories-card-dashboard | MIG-0079 | UX-0079 | pending |
| /legacy/Pages/Widgets/DoughnutChart | Pages | none | not started | /pages/widgets/doughnut-chart | MIG-0080 | UX-0080 | pending |
| /legacy/Pages/Widgets/LineChart | Pages | none | not started | /pages/widgets/line-chart | MIG-0081 | UX-0081 | pending |
| /legacy/Pages/Widgets/LineChartWithoutDots | Pages | none | not started | /pages/widgets/line-chart-without-dots | MIG-0082 | UX-0082 | pending |
| /legacy/Pages/Widgets/MixedChart | Pages | none | not started | /pages/widgets/mixed-chart | MIG-0083 | UX-0083 | pending |
| /legacy/Pages/Widgets/PieChart | Pages | none | not started | /pages/widgets/pie-chart | MIG-0084 | UX-0084 | pending |
| /legacy/Pages/Widgets/PolarChart | Pages | none | not started | /pages/widgets/polar-chart | MIG-0085 | UX-0085 | pending |
| /legacy/Pages/Widgets/RadarChart | Pages | none | not started | /pages/widgets/radar-chart | MIG-0086 | UX-0086 | pending |

## Ecommerce

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Ecommerce/Orders/OrderDetails | Ecommerce | none | not started | /ecommerce/orders/order-details | MIG-0032 | UX-0032 | pending |
| /legacy/Ecommerce/Orders/OrderList | Ecommerce | none | done | /ecommerce/orders/order-list | MIG-0033 | UX-0033 | migrated |
| /legacy/Ecommerce/Orders/Widgets/TableOrders | Ecommerce | none | not started | /ecommerce/orders/widgets/table-orders | MIG-0034 | UX-0034 | pending |
| /legacy/Ecommerce/Products/EditProduct | Ecommerce | none | not started | /ecommerce/products/edit-product | MIG-0035 | UX-0035 | pending |
| /legacy/Ecommerce/Products/NewProduct | Ecommerce | none | not started | /ecommerce/products/new-product | MIG-0036 | UX-0036 | pending |
| /legacy/Ecommerce/Products/ProductPage | Ecommerce | none | not started | /ecommerce/products/product-page | MIG-0037 | UX-0037 | pending |
| /legacy/Ecommerce/Products/Widgets/Dropzone | Ecommerce | none | not started | /ecommerce/products/widgets/dropzone | MIG-0038 | UX-0038 | pending |
| /legacy/Ecommerce/Products/Widgets/HtmlEditor | Ecommerce | none | not started | /ecommerce/products/widgets/html-editor | MIG-0039 | UX-0039 | pending |
| /legacy/Ecommerce/Products/Widgets/TableProducts | Ecommerce | none | not started | /ecommerce/products/widgets/table-products | MIG-0040 | UX-0040 | pending |

## Applications

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Applications/Calendar | Applications | none | not started | /applications/calendar | MIG-0002 | UX-0002 | pending |
| /legacy/Applications/Datatables | Applications | none | not started | /applications/datatables | MIG-0003 | UX-0003 | pending |
| /legacy/Applications/Kanban | Applications | none | not started | /applications/kanban | MIG-0004 | UX-0004 | pending |
| /legacy/Applications/Widgets/CalendarWidget | Applications | @fullcalendar/daygrid; @fullcalendar/interaction; @fullcalendar/timegrid; @fullcalendar/vue | not started | /applications/widgets/calendar-widget | MIG-0005 | UX-0005 | pending |
| /legacy/Applications/Widgets/DatatableSearch | Applications | none | not started | /applications/widgets/datatable-search | MIG-0006 | UX-0006 | pending |
| /legacy/Applications/Widgets/DatatableSimple | Applications | none | not started | /applications/widgets/datatable-simple | MIG-0007 | UX-0007 | pending |
| /legacy/Applications/Wizard | Applications | none | done | /applications/wizard | MIG-0008 | UX-0008 | migrated |

## Tables

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Tables/PaginatedTables | Tables | none | not started | /tables/paginated-tables | MIG-0087 | UX-0087 | pending |
| /legacy/Tables/RegularTables | Tables | none | done | /tables/regular-tables | MIG-0088 | UX-0088 | migrated |
| /legacy/Tables/SortableTables | Tables | none | not started | /tables/sortable-tables | MIG-0089 | UX-0089 | pending |
| /legacy/Tables/Tables/PaginatedTable | Tables | none | not started | /tables/tables/paginated-table | MIG-0090 | UX-0090 | pending |

## Layout

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Layout/AuthBasicLayout | Layout | @/components/AppBarAuth; @/components/Footer.vue | not started | /layout/auth-basic-layout | MIG-0041 | UX-0041 | pending |
| /legacy/Layout/AuthCoverLayout | Layout | @/components/AppBarAuth; @/components/Footer.vue | not started | /layout/auth-cover-layout | MIG-0042 | UX-0042 | pending |
| /legacy/Layout/AuthIllustrationLayout | Layout | @/components/AppBarBlurAuth | not started | /layout/auth-illustration-layout | MIG-0043 | UX-0043 | pending |
| /legacy/Layout/DashboardLayout | Layout | @/components/AppBar.vue; @/components/Drawer.vue; @/components/Footer.vue; @/components/Widgets/SettingsDrawer.vue | not started | /layout/dashboard-layout | MIG-0044 | UX-0044 | pending |
| /legacy/Layout/DashboardLayoutVr | Layout | @/components/AppBar.vue; @/components/Drawer.vue; @/components/Footer.vue | not started | /layout/dashboard-layout-vr | MIG-0045 | UX-0045 | pending |
| /legacy/Layout/PageLayout | Layout | @/components/AppBarAuth; @/components/Footer.vue | done | /layout/page-layout | MIG-0046 | UX-0046 | migrated |
| /legacy/Layout/ProfileLayout | Layout | @/components/AppBarProfile.vue; @/components/AppBarProfileWhite.vue; @/components/Drawer.vue; @/components/Footer.vue | not started | /layout/profile-layout | MIG-0047 | UX-0047 | pending |

## Components

| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /legacy/Components/Notifications | Components | none | done | /components/notifications | MIG-0009 | UX-0009 | migrated |

