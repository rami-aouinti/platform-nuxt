const ROUNDED_CLASS_MAP = {
  sm: 'ui-rounded-sm',
  md: 'ui-rounded-md',
  lg: 'ui-rounded-lg',
  xl: 'ui-rounded-xl',
  pill: 'ui-rounded-pill',
} as const

const SHADOW_CLASS_MAP = {
  none: 'ui-shadow-none',
  sm: 'ui-shadow-sm',
  md: 'ui-shadow-md',
  lg: 'ui-shadow-lg',
  xl: 'ui-shadow-xl',
} as const

export type UiComponentType = 'button' | 'card' | 'avatar'

export function resolveRoundedClass(
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'pill' | string,
): string | undefined {
  if (!rounded || typeof rounded === 'boolean') {
    return undefined
  }

  return ROUNDED_CLASS_MAP[rounded as keyof typeof ROUNDED_CLASS_MAP]
}

export function resolveShadowClass(
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string,
): string | undefined {
  if (!shadow) {
    return undefined
  }

  return SHADOW_CLASS_MAP[shadow as keyof typeof SHADOW_CLASS_MAP]
}

export function resolveColorClass(
  color: string | undefined,
  componentType: UiComponentType,
): string | undefined {
  if (!color || color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) {
    return undefined
  }

  return `ui-${componentType}--color-${color}`
}
