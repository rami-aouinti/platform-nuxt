import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminTable from '~/components/admin/AdminTable.vue'

describe('component AdminTable.vue', () => {
  it('renders safely when rows prop is omitted', async () => {
    const wrapper = await mountSuspended(AdminTable, {
      props: {
        columns: [
          { title: 'Name', key: 'name' },
        ],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucun résultat')
  })
})
