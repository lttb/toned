// TODO: move to configuration

export const initMedia = () => {
  const w = typeof window === 'undefined' ? null : window

  const mediaSmall = w?.matchMedia('(min-width: 640px)')
  const mediaMedium = w?.matchMedia('(min-width: 768px)')
  const mediaLarge = w?.matchMedia('(min-width: 1024px)')

  const mediaEmitter = new Emitter<
    Partial<{
      '@media.small': boolean
      '@media.medium': boolean
      '@media.large': boolean
    }>
  >({
    '@media.small': mediaSmall?.matches,
    '@media.medium': mediaMedium?.matches,
    '@media.large': mediaLarge?.matches,
  })

  // NOTE: have to use `addListener` for expo-media compat

  mediaSmall?.addListener((e) => {
    console.log('emit.small', e.matches)
    mediaEmitter.emit({ '@media.small': e.matches })
  })
  mediaMedium?.addListener((e) => {
    mediaEmitter.emit({ '@media.medium': e.matches })
  })
  mediaLarge?.addListener((e) => {
    mediaEmitter.emit({ '@media.large': e.matches })
  })

  return mediaEmitter
}

class Emitter<T extends Record<string, any>> {
  private listeners = new Set<(data: Partial<T>) => void>()

  constructor(public data: T) {}

  emit(data: Partial<T>) {
    Object.assign(this.data, data)

    this.listeners.forEach((cb) => {
      cb(data)
    })
  }

  sub(listener: (data: Partial<T>) => void) {
    this.listeners.add(listener)

    return () => this.listeners.delete(listener)
  }
}
