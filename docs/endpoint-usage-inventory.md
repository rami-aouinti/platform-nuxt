# Endpoint usage inventory

Source: scan automatique des chemins `app/**`, `services/**`, `server/api/**` + croisement avec la liste métier de `docs/legacy-upstream-endpoints-mapping.md` et `docs/canonical-vs-deprecated-endpoints.md`.

## 1) Endpoint usage

| Endpoint | Fichier appelant | Type | Statut |
| --- | --- | --- | --- |
| `/api/:param` | `app/components/Administration/ApiKeysManager.vue` | direct | active |
| `/api/api/v1/admin/role` | `server/api/role/index.get.ts` | proxy | active |
| `/api/api/v1/admin/role` | `server/api/role/index.post.ts` | proxy | active |
| `/api/api/v1/admin/role/:param` | `server/api/role/[role].get.ts` | proxy | active |
| `/api/api/v1/admin/role/:param` | `server/api/role/[role]/index.delete.ts` | proxy | active |
| `/api/api/v1/admin/role/:param` | `server/api/role/[role]/index.patch.ts` | proxy | active |
| `/api/api/v1/admin/role/:param/inherited` | `server/api/role/[role]/inherited.get.ts` | proxy | active |
| `/api/api/v1/admin/role/count` | `server/api/role/count.get.ts` | proxy | active |
| `/api/api/v1/admin/role/ids` | `server/api/role/ids.get.ts` | proxy | active |
| `/api/api/v1/admin/role/inherited` | `server/api/role/inherited.get.ts` | proxy | active |
| `/api/api/v1/admin/role/schema` | `server/api/role/schema.get.ts` | proxy | active |
| `/api/api/v1/admin/user_group` | `server/api/user_group/index.get.ts` | proxy | active |
| `/api/api/v1/admin/user_group` | `server/api/user_group/index.post.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param` | `server/api/user_group/[id].get.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param` | `server/api/user_group/[id]/index.delete.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param` | `server/api/user_group/[id]/index.patch.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param` | `server/api/user_group/[id]/index.put.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param/user/:param` | `server/api/user_group/[userGroup]/user/[user]/index.delete.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param/user/:param` | `server/api/user_group/[userGroup]/user/[user]/index.post.ts` | proxy | active |
| `/api/api/v1/admin/user_group/:param/users` | `server/api/user_group/[userGroup]/users.get.ts` | proxy | active |
| `/api/api/v1/admin/user_group/count` | `server/api/user_group/count.get.ts` | proxy | active |
| `/api/api/v1/admin/user_group/ids` | `server/api/user_group/ids.get.ts` | proxy | active |
| `/api/api/v1/admin/user_group/schema` | `server/api/user_group/schema.get.ts` | proxy | active |
| `/api/api/v1/admin/users` | `server/api/user/index.get.ts` | proxy | active |
| `/api/api/v1/admin/users` | `server/api/user/index.post.ts` | proxy | active |
| `/api/api/v1/admin/users/:param` | `server/api/user/[id].get.ts` | proxy | active |
| `/api/api/v1/admin/users/:param` | `server/api/user/[id]/index.delete.ts` | proxy | active |
| `/api/api/v1/admin/users/:param` | `server/api/user/[id]/index.patch.ts` | proxy | active |
| `/api/api/v1/admin/users/:param` | `server/api/user/[id]/index.put.ts` | proxy | active |
| `/api/api/v1/admin/users/:param/group/:param` | `server/api/user/[id]/group/[userGroup]/index.delete.ts` | proxy | active |
| `/api/api/v1/admin/users/:param/group/:param` | `server/api/user/[id]/group/[userGroup]/index.post.ts` | proxy | active |
| `/api/api/v1/admin/users/:param/groups` | `server/api/user/[id]/groups.get.ts` | proxy | active |
| `/api/api/v1/admin/users/:param/roles` | `server/api/user/[id]/roles.get.ts` | proxy | active |
| `/api/api/v1/admin/users/count` | `server/api/user/count.get.ts` | proxy | active |
| `/api/api/v1/admin/users/ids` | `server/api/user/ids.get.ts` | proxy | active |
| `/api/api/v1/admin/users/schema` | `server/api/user/schema.get.ts` | proxy | active |
| `/api/auth/get_token` | `app/stores/auth.ts` | direct | active |
| `/api/auth/logout` | `app/stores/auth.ts` | direct | active |
| `/api/candidates` | `app/pages/administration/candidates/index.vue` | direct | active |
| `/api/candidates/:param` | `app/pages/administration/candidates/[id].vue` | direct | active |
| `/api/companies/:param` | `app/pages/administration/companies/[id].vue` | direct | active |
| `/api/companies/:param` | `server/api/companies/[id].get.ts` | proxy | active |
| `/api/companies/:param` | `server/api/companies/index.get.ts` | proxy | active |
| `/api/companies/:param/members` | `app/pages/administration/companies/[id].vue` | direct | active |
| `/api/companies/:param/members` | `server/api/companies/[id]/members.get.ts` | proxy | active |
| `/api/job-applications` | `server/api/job-applications/index.post.ts` | proxy | active |
| `/api/job-applications/:param` | `server/api/job-applications/[id].delete.ts` | proxy | active |
| `/api/job-applications/:param` | `server/api/job-applications/[id].get.ts` | proxy | active |
| `/api/job-applications/:param` | `server/api/job-applications/[id].patch.ts` | proxy | active |
| `/api/job-applications/:param` | `server/api/job-applications/[id].put.ts` | proxy | active |
| `/api/job-applications/:param` | `server/api/job-applications/index.get.ts` | proxy | active |
| `/api/job-applications/:param/accept` | `server/api/job-applications/[id]/accept.patch.ts` | proxy | active |
| `/api/job-applications/:param/reject` | `server/api/job-applications/[id]/reject.patch.ts` | proxy | active |
| `/api/job-applications/:param/withdraw` | `server/api/job-applications/[id]/withdraw.patch.ts` | proxy | active |
| `/api/job-offers` | `server/api/job-offers/index.post.ts` | proxy | active |
| `/api/job-offers/:param` | `server/api/job-offers/[id].delete.ts` | proxy | active |
| `/api/job-offers/:param` | `server/api/job-offers/[id].get.ts` | proxy | active |
| `/api/job-offers/:param` | `server/api/job-offers/[id].patch.ts` | proxy | active |
| `/api/job-offers/:param` | `server/api/job-offers/[id].put.ts` | proxy | active |
| `/api/job-offers/:param` | `server/api/job-offers/index.get.ts` | proxy | active |
| `/api/job-offers/:param/apply` | `server/api/job-offers/[id]/apply.post.ts` | proxy | active |
| `/api/job-offers/available/:param` | `server/api/job-offers/available.get.ts` | proxy | active |
| `/api/job-offers/my/:param` | `server/api/job-offers/my.get.ts` | proxy | active |
| `/api/notifications` | `app/pages/administration/notifications/index.vue` | direct | active |
| `/api/notifications/:param` | `app/pages/administration/notifications/[id].vue` | direct | active |
| `/api/notifications/:param` | `server/api/notifications/[id].get.ts` | proxy | active |
| `/api/notifications/:param` | `server/api/notifications/index.get.ts` | proxy | active |
| `/api/notifications/:param/read` | `server/api/notifications/[id]/read.patch.ts` | proxy | active |
| `/api/notifications/read-all` | `server/api/notifications/read-all.patch.ts` | proxy | active |
| `/api/notifications/unread-count` | `server/api/notifications/unread-count.get.ts` | proxy | active |
| `/api/people` | `app/pages/auth.vue` | direct | active |
| `/api/profile` | `app/stores/auth.ts` | direct | deprecated |
| `/api/profile/groups` | `app/stores/auth.ts` | direct | deprecated |
| `/api/profile/roles` | `app/stores/auth.ts` | direct | deprecated |
| `/api/profile/roles` | `app/stores/auth.ts` | direct | deprecated |
| `/api/user_group/:param` | `app/pages/administration/user-groups/[id].vue` | direct | active |
| `/api/user_group/:param` | `app/pages/administration/user-groups/[id].vue` | direct | active |
| `/api/user_group/:param/user/:param` | `app/pages/administration/user-groups/[id].vue` | direct | active |
| `/api/user_group/:param/user/:param` | `app/pages/administration/user-groups/[id].vue` | direct | active |
| `/api/user_group/:param/users` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/user_group/:param/users` | `app/pages/administration/user-groups/[id].vue` | direct | active |
| `/api/user/:param` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/user/:param` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/user/:param` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/user/:param` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/user/:param/group/:param` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/user/:param/groups` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/user/:param/groups` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/user/:param/roles` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/user/:param/roles` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/v1/admin/api-keys` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/api-keys` | `services/admin/api-keys/v1.ts` | direct | active |
| `/api/v1/admin/api-keys` | `services/admin/api-keys/v2.ts` | direct | active |
| `/api/v1/admin/api-keys/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/api-keys/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/candidates` | `services/admin/candidates/index.ts` | direct | active |
| `/api/v1/admin/companies` | `services/admin/companies/index.ts` | direct | active |
| `/api/v1/admin/job-applications` | `services/admin/job-applications/index.ts` | direct | active |
| `/api/v1/admin/job-offers` | `services/admin/job-offers/index.ts` | direct | active |
| `/api/v1/admin/job-offers/:param/apply` | `services/admin/job-applications/index.ts` | direct | active |
| `/api/v1/admin/notifications` | `services/admin/notifications/index.ts` | direct | active |
| `/api/v1/admin/roles` | `app/pages/admin/user-management/roles/index.vue` | direct | active |
| `/api/v1/admin/roles` | `app/pages/admin/user-management/roles/index.vue` | direct | active |
| `/api/v1/admin/roles` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/roles` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/roles` | `services/admin/roles/index.ts` | direct | active |
| `/api/v1/admin/roles/count` | `app/pages/admin/user-management/roles/index.vue` | direct | active |
| `/api/v1/admin/roles/count` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/roles/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/roles/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/user-groups` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/user-groups` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/user-groups` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/user-groups` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/user-groups` | `app/pages/administration/users/[id].vue` | direct | active |
| `/api/v1/admin/user-groups` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/user-groups` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/user-groups` | `services/admin/user-groups/index.ts` | direct | active |
| `/api/v1/admin/user-groups/count` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/user-groups/count` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/user-groups/ids` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/user-groups/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/user-groups/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/users` | `app/composables/api/useCrmApi.ts` | direct | active |
| `/api/v1/admin/users` | `app/composables/api/useUsersApi.ts` | direct | active |
| `/api/v1/admin/users` | `app/pages/admin/user-management/user-groups/index.vue` | direct | active |
| `/api/v1/admin/users` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/users` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/users` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/users` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/users` | `services/admin/users/index.ts` | direct | active |
| `/api/v1/admin/users/count` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/users/count` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/users/ids` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/users/schema` | `app/pages/admin/user-management/users/index.vue` | direct | active |
| `/api/v1/admin/users/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/admin/users/schema` | `app/services/admin/resource-descriptors.ts` | direct | active |
| `/api/v1/api_key/schema` | `server/api/api_key/schema.get.ts` | proxy | active |
| `/api/v1/auth/get_token` | `server/api/auth/get_token.post.ts` | proxy | active |
| `/api/v1/blog-comments` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v1/blog-post-links` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v1/blog-posts` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v1/blog-tags` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v1/calendar/events` | `app/composables/api/useCalendarApi.ts` | direct | active |
| `/api/v1/candidates/:param` | `server/api/candidates/[id].get.ts` | proxy | active |
| `/api/v1/candidates/:param` | `server/api/candidates/index.get.ts` | proxy | active |
| `/api/v1/chat` | `app/composables/api/useChatApi.ts` | direct | active |
| `/api/v1/companies` | `app/composables/api/useCompaniesApi.ts` | direct | deprecated |
| `/api/v1/companies` | `app/composables/api/useCrmApi.ts` | direct | deprecated |
| `/api/v1/me/account` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/account/deactivate` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/deactivate` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/delete` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/notification-settings` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/password` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/profile` | `app/components/profile/tabs/BasicInfoTab.vue` | direct | active |
| `/api/v1/me/profile` | `app/components/profile/tabs/BasicInfoTab.vue` | direct | active |
| `/api/v1/me/profile/addresses` | `server/api/me/profile/addresses.get.ts` | proxy | active |
| `/api/v1/me/profile/addresses` | `server/api/me/profile/addresses.post.ts` | proxy | active |
| `/api/v1/me/profile/addresses` | `server/api/v1/me/profile/addresses.get.ts` | proxy | active |
| `/api/v1/me/profile/addresses` | `server/api/v1/me/profile/addresses.post.ts` | proxy | active |
| `/api/v1/me/profile/addresses/:param` | `server/api/me/profile/addresses/[addressId].delete.ts` | proxy | active |
| `/api/v1/me/profile/addresses/:param` | `server/api/me/profile/addresses/[addressId].patch.ts` | proxy | active |
| `/api/v1/me/profile/addresses/:param` | `server/api/v1/me/profile/addresses/[addressId].delete.ts` | proxy | active |
| `/api/v1/me/profile/addresses/:param` | `server/api/v1/me/profile/addresses/[addressId].patch.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/me/profile/avatar.delete.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/me/profile/avatar.get.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/me/profile/avatar.patch.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/v1/me/profile/avatar.delete.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/v1/me/profile/avatar.get.ts` | proxy | active |
| `/api/v1/me/profile/avatar` | `server/api/v1/me/profile/avatar.patch.ts` | proxy | active |
| `/api/v1/me/profile/companies` | `app/composables/useProfileCompaniesApi.ts` | direct | active |
| `/api/v1/me/profile/groups` | `server/api/me/profile/groups.get.ts` | proxy | active |
| `/api/v1/me/profile/groups` | `server/api/v1/me/profile/groups.get.ts` | proxy | active |
| `/api/v1/me/profile/password` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/profile/projects` | `app/pages/profile/index.vue` | direct | active |
| `/api/v1/me/profile/resumes` | `app/composables/useResumeApi.ts` | direct | active |
| `/api/v1/me/profile/resumes/:param/educations` | `app/composables/useResumeApi.ts` | direct | active |
| `/api/v1/me/profile/resumes/:param/experiences` | `app/composables/useResumeApi.ts` | direct | active |
| `/api/v1/me/profile/resumes/:param/skills` | `app/composables/useResumeApi.ts` | direct | active |
| `/api/v1/me/profile/roles` | `server/api/me/profile/roles.get.ts` | proxy | active |
| `/api/v1/me/profile/roles` | `server/api/v1/me/profile/roles.get.ts` | proxy | active |
| `/api/v1/me/sessions` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/social-accounts` | `app/components/profile/tabs/AccountsTab.vue` | direct | active |
| `/api/v1/me/social-accounts` | `app/pages/profile/index.vue` | direct | active |
| `/api/v1/me/social-accounts` | `server/api/me/social-accounts/index.get.ts` | proxy | active |
| `/api/v1/me/social-accounts` | `server/api/v1/me/social-accounts/index.get.ts` | proxy | active |
| `/api/v1/me/social-accounts/:param` | `app/components/profile/tabs/AccountsTab.vue` | direct | active |
| `/api/v1/me/social-accounts/:param` | `server/api/me/social-accounts/[provider].delete.ts` | proxy | active |
| `/api/v1/me/social-accounts/:param` | `server/api/v1/me/social-accounts/[provider].delete.ts` | proxy | active |
| `/api/v1/me/social-accounts/link` | `app/components/profile/tabs/AccountsTab.vue` | direct | active |
| `/api/v1/me/social-accounts/link` | `server/api/me/social-accounts/link.post.ts` | proxy | active |
| `/api/v1/me/social-accounts/link` | `server/api/v1/me/social-accounts/link.post.ts` | proxy | active |
| `/api/v1/me/two-factor` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/me/two-factor-auth` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v1/projects` | `app/composables/api/useCrmApi.ts` | direct | active |
| `/api/v1/projects` | `app/composables/api/useProjectsApi.ts` | direct | active |
| `/api/v1/quizzes` | `app/composables/api/useQuizzesApi.ts` | direct | active |
| `/api/v1/sprints` | `app/composables/api/useCrmApi.ts` | direct | active |
| `/api/v1/sprints` | `app/composables/api/useSprintsApi.ts` | direct | active |
| `/api/v1/statistics/distributions/statuses` | `app/pages/admin/dashboard/index.vue` | direct | active |
| `/api/v1/statistics/entities` | `app/pages/admin/dashboard/index.vue` | direct | active |
| `/api/v1/statistics/overview` | `app/pages/admin/dashboard/index.vue` | direct | active |
| `/api/v1/statistics/timeseries` | `app/pages/admin/dashboard/index.vue` | direct | active |
| `/api/v1/task-requests` | `app/composables/api/useCrmApi.ts` | direct | active |
| `/api/v1/task-requests` | `app/composables/api/useTaskRequestsApi.ts` | direct | active |
| `/api/v1/task-requests/:param/blog-posts` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v1/tasks` | `app/composables/api/useCrmApi.ts` | direct | active |
| `/api/v1/tasks` | `app/composables/api/useTasksApi.ts` | direct | active |
| `/api/v1/tasks/:param/blog-posts` | `app/composables/api/useBlogApi.ts` | direct | active |
| `/api/v2/me/account` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v2/me/account/deactivate` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v2/me/notification-settings` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v2/me/password` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v2/me/sessions` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |
| `/api/v2/me/two-factor-auth` | `app/services/profile/profile-endpoint-resolver.ts` | direct | active |

## 2) Classification métier

| Endpoint | Classification métier | Endpoint cible |
| --- | --- | --- |
| `/api/:param` | Conservé | — |
| `/api/api/v1/admin/role` | Conservé | — |
| `/api/api/v1/admin/role/:param` | Conservé | — |
| `/api/api/v1/admin/role/:param/inherited` | Conservé | — |
| `/api/api/v1/admin/role/count` | Conservé | — |
| `/api/api/v1/admin/role/ids` | Conservé | — |
| `/api/api/v1/admin/role/inherited` | Conservé | — |
| `/api/api/v1/admin/role/schema` | Conservé | — |
| `/api/api/v1/admin/user_group` | Conservé | — |
| `/api/api/v1/admin/user_group/:param` | Conservé | — |
| `/api/api/v1/admin/user_group/:param/user/:param` | Conservé | — |
| `/api/api/v1/admin/user_group/:param/users` | Conservé | — |
| `/api/api/v1/admin/user_group/count` | Conservé | — |
| `/api/api/v1/admin/user_group/ids` | Conservé | — |
| `/api/api/v1/admin/user_group/schema` | Conservé | — |
| `/api/api/v1/admin/users` | Conservé | — |
| `/api/api/v1/admin/users/:param` | Conservé | — |
| `/api/api/v1/admin/users/:param/group/:param` | Conservé | — |
| `/api/api/v1/admin/users/:param/groups` | Conservé | — |
| `/api/api/v1/admin/users/:param/roles` | Conservé | — |
| `/api/api/v1/admin/users/count` | Conservé | — |
| `/api/api/v1/admin/users/ids` | Conservé | — |
| `/api/api/v1/admin/users/schema` | Conservé | — |
| `/api/auth/get_token` | Conservé | — |
| `/api/auth/logout` | Conservé | — |
| `/api/candidates` | Conservé | — |
| `/api/candidates/:param` | Conservé | — |
| `/api/companies/:param` | Conservé | — |
| `/api/companies/:param/members` | Conservé | — |
| `/api/job-applications` | Conservé | — |
| `/api/job-applications/:param` | Conservé | — |
| `/api/job-applications/:param/accept` | Conservé | — |
| `/api/job-applications/:param/reject` | Conservé | — |
| `/api/job-applications/:param/withdraw` | Conservé | — |
| `/api/job-offers` | Conservé | — |
| `/api/job-offers/:param` | Conservé | — |
| `/api/job-offers/:param/apply` | Conservé | — |
| `/api/job-offers/available/:param` | Conservé | — |
| `/api/job-offers/my/:param` | Conservé | — |
| `/api/notifications` | Conservé | — |
| `/api/notifications/:param` | Conservé | — |
| `/api/notifications/:param/read` | Conservé | — |
| `/api/notifications/read-all` | Conservé | — |
| `/api/notifications/unread-count` | Conservé | — |
| `/api/people` | Conservé | — |
| `/api/profile` | Fusionné | `/api/v1/me/profile` |
| `/api/profile/groups` | Fusionné | `/api/v1/me/profile/groups` |
| `/api/profile/roles` | Fusionné | `/api/v1/me/profile/roles` |
| `/api/user_group/:param` | Conservé | — |
| `/api/user_group/:param/user/:param` | Conservé | — |
| `/api/user_group/:param/users` | Conservé | — |
| `/api/user/:param` | Conservé | — |
| `/api/user/:param/group/:param` | Conservé | — |
| `/api/user/:param/groups` | Conservé | — |
| `/api/user/:param/roles` | Conservé | — |
| `/api/v1/admin/api-keys` | Conservé | — |
| `/api/v1/admin/api-keys/schema` | Conservé | — |
| `/api/v1/admin/candidates` | Conservé | — |
| `/api/v1/admin/companies` | Conservé | — |
| `/api/v1/admin/job-applications` | Conservé | — |
| `/api/v1/admin/job-offers` | Conservé | — |
| `/api/v1/admin/job-offers/:param/apply` | Conservé | — |
| `/api/v1/admin/notifications` | Conservé | — |
| `/api/v1/admin/roles` | Conservé | — |
| `/api/v1/admin/roles/count` | Conservé | — |
| `/api/v1/admin/roles/schema` | Conservé | — |
| `/api/v1/admin/user-groups` | Conservé | — |
| `/api/v1/admin/user-groups/count` | Conservé | — |
| `/api/v1/admin/user-groups/ids` | Conservé | — |
| `/api/v1/admin/user-groups/schema` | Conservé | — |
| `/api/v1/admin/users` | Conservé | — |
| `/api/v1/admin/users/count` | Conservé | — |
| `/api/v1/admin/users/ids` | Conservé | — |
| `/api/v1/admin/users/schema` | Conservé | — |
| `/api/v1/api_key/schema` | Conservé | — |
| `/api/v1/auth/get_token` | Conservé | — |
| `/api/v1/blog-comments` | Conservé | — |
| `/api/v1/blog-post-links` | Conservé | — |
| `/api/v1/blog-posts` | Conservé | — |
| `/api/v1/blog-tags` | Conservé | — |
| `/api/v1/calendar/events` | Conservé | — |
| `/api/v1/candidates/:param` | Conservé | — |
| `/api/v1/chat` | Conservé | — |
| `/api/v1/companies` | Fusionné | `/api/companies` |
| `/api/v1/me/account` | Conservé | — |
| `/api/v1/me/account/deactivate` | Conservé | — |
| `/api/v1/me/deactivate` | Conservé | — |
| `/api/v1/me/delete` | Conservé | — |
| `/api/v1/me/notification-settings` | Conservé | — |
| `/api/v1/me/password` | Conservé | — |
| `/api/v1/me/profile` | Conservé | — |
| `/api/v1/me/profile/addresses` | Conservé | — |
| `/api/v1/me/profile/addresses/:param` | Conservé | — |
| `/api/v1/me/profile/avatar` | Conservé | — |
| `/api/v1/me/profile/companies` | Conservé | — |
| `/api/v1/me/profile/groups` | Conservé | — |
| `/api/v1/me/profile/password` | Conservé | — |
| `/api/v1/me/profile/projects` | Conservé | — |
| `/api/v1/me/profile/resumes` | Conservé | — |
| `/api/v1/me/profile/resumes/:param/educations` | Conservé | — |
| `/api/v1/me/profile/resumes/:param/experiences` | Conservé | — |
| `/api/v1/me/profile/resumes/:param/skills` | Conservé | — |
| `/api/v1/me/profile/roles` | Conservé | — |
| `/api/v1/me/sessions` | Conservé | — |
| `/api/v1/me/social-accounts` | Conservé | — |
| `/api/v1/me/social-accounts/:param` | Conservé | — |
| `/api/v1/me/social-accounts/link` | Conservé | — |
| `/api/v1/me/two-factor` | Conservé | — |
| `/api/v1/me/two-factor-auth` | Conservé | — |
| `/api/v1/projects` | Conservé | — |
| `/api/v1/quizzes` | Conservé | — |
| `/api/v1/sprints` | Conservé | — |
| `/api/v1/statistics/distributions/statuses` | Conservé | — |
| `/api/v1/statistics/entities` | Conservé | — |
| `/api/v1/statistics/overview` | Conservé | — |
| `/api/v1/statistics/timeseries` | Conservé | — |
| `/api/v1/task-requests` | Conservé | — |
| `/api/v1/task-requests/:param/blog-posts` | Conservé | — |
| `/api/v1/tasks` | Conservé | — |
| `/api/v1/tasks/:param/blog-posts` | Conservé | — |
| `/api/v2/me/account` | Conservé | — |
| `/api/v2/me/account/deactivate` | Conservé | — |
| `/api/v2/me/notification-settings` | Conservé | — |
| `/api/v2/me/password` | Conservé | — |
| `/api/v2/me/sessions` | Conservé | — |
| `/api/v2/me/two-factor-auth` | Conservé | — |

## 3) Plan de migration des endpoints supprimés

| Endpoint à supprimer | Endpoint remplaçant | Impacts front | Rollback |
| --- | --- | --- | --- |
| `/api/profile` | `/api/v1/me/profile` | Mettre à jour les appels front/services vers le endpoint remplaçant. | Conserver un fallback temporaire vers /api/profile derrière un flag serveur. |
| `/api/profile/groups` | `/api/v1/me/profile/groups` | Mettre à jour les appels front/services vers le endpoint remplaçant. | Conserver un fallback temporaire vers /api/profile/groups derrière un flag serveur. |
| `/api/profile/roles` | `/api/v1/me/profile/roles` | Mettre à jour les appels front/services vers le endpoint remplaçant. | Conserver un fallback temporaire vers /api/profile/roles derrière un flag serveur. |
| `/api/v1/companies` | `/api/companies` | Mettre à jour les appels front/services vers le endpoint remplaçant. | Conserver un fallback temporaire vers /api/v1/companies derrière un flag serveur. |

## 4) Règle CI

- Validation via `scripts/check-endpoint-inventory.mjs`: bloque les endpoints hors convention (sauf allow-list legacy) et ceux non enregistrés.
- Job CI ajouté pour exécuter `pnpm run endpoint:inventory:check`.

## 5) Nettoyage post-migration

- Routes serveur et services front actuellement référencés par l'inventaire: **conservés**.
- Suppression automatique conditionnée à un inventaire vide de références en CI (`endpoint:inventory:check`).
- Documentation nettoyée: ce document devient la source d'inventaire unique.
