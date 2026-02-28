import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { VAvatar, VBtn, VCard } from 'vuetify/components'
import DialogConfirm from '~/components/DialogConfirm.vue'
import UiAvatar from '~/components/ui/UiAvatar.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiCard from '~/components/ui/UiCard.vue'

vi.stubGlobal('visualViewport', new EventTarget())

describe('component DialogConfirm.vue', () => {
  it('should not open', async () => {
    const wrapper = await mountSuspended(DialogConfirm)
    expect(wrapper.html()).toMatchInlineSnapshot(`""`)
  })

  it('should open and close', async () => {
    const wrapper = await mountSuspended(DialogConfirm)
    wrapper.vm.open('message')
    await nextTick()
    const cardWrapper = wrapper.getComponent(VCard)
    expect(cardWrapper.text()).toContain('message')
    expect(cardWrapper.html()).toMatchSnapshot()
    expect(cardWrapper.find('button').exists()).toBe(true)

    await cardWrapper.find('button').trigger('click')
    expect(cardWrapper.isVisible()).toBe(false)
  })
})

describe('ui wrappers rendering', () => {
  it('maps UiButton props to classes and forwards attrs', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: {
        rounded: 'pill',
        shadow: 'lg',
        to: '/profile',
        loading: true,
        disabled: true,
      },
      attrs: {
        href: '/fallback',
        'aria-label': 'profile action',
      },
      slots: {
        default: 'Open profile',
      },
    })

    const button = wrapper.getComponent(VBtn)
    expect(button.classes()).toEqual(
      expect.arrayContaining(['ui-rounded-pill', 'ui-shadow-lg']),
    )
    expect(button.props('to')).toBe('/profile')
    expect(button.attributes('href')).toBe('/fallback')
    expect(button.attributes('aria-label')).toBe('profile action')
    expect(button.props('loading')).toBe(true)
    expect(button.props('disabled')).toBe(true)
    expect(button.text()).toContain('Open profile')
  })

  it('renders UiCard slots and maps visual props', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: {
        rounded: 'xl',
        shadow: 'md',
      },
      attrs: {
        'aria-label': 'card',
      },
      slots: {
        default: '<div class="content-slot">Card content</div>',
      },
    })

    const card = wrapper.getComponent(VCard)
    expect(card.classes()).toEqual(
      expect.arrayContaining(['ui-rounded-xl', 'ui-shadow-md']),
    )
    expect(card.attributes('aria-label')).toBe('card')
    expect(card.find('.content-slot').exists()).toBe(true)
  })

  it('renders UiAvatar slots and forwards aria attrs', async () => {
    const wrapper = await mountSuspended(UiAvatar, {
      props: {
        rounded: 'lg',
        shadow: 'sm',
      },
      attrs: {
        'aria-label': 'avatar',
      },
      slots: {
        default: '<span class="avatar-slot">AB</span>',
      },
    })

    const avatar = wrapper.getComponent(VAvatar)
    expect(avatar.classes()).toEqual(
      expect.arrayContaining(['ui-rounded-lg', 'ui-shadow-sm']),
    )
    expect(avatar.attributes('aria-label')).toBe('avatar')
    expect(avatar.find('.avatar-slot').exists()).toBe(true)
  })
})
