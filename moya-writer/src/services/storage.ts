export type StorageNamespace = 'projects' | 'documents' | 'storyBible' | 'history' | 'settings' | 'storyState' | 'storyEngine'

type StorageDriver = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const memoryStore = new Map<string, string>()

const memoryDriver: StorageDriver = {
  async getItem(key) {
    return memoryStore.get(key) ?? null
  },
  async setItem(key, value) {
    memoryStore.set(key, value)
  },
  async removeItem(key) {
    memoryStore.delete(key)
  },
}

let driver: StorageDriver = memoryDriver

function createWindowDriver(): StorageDriver | null {
  if (typeof window === 'undefined') return null
  const storage = (window as unknown as { storage?: any }).storage
  if (!storage) return null
  const hasAsyncAPI =
    typeof storage.get === 'function' &&
    typeof storage.set === 'function' &&
    typeof storage.remove === 'function'
  if (!hasAsyncAPI) return null
  return {
    async getItem(key: string) {
      const result = await storage.get(key)
      return result ?? null
    },
    async setItem(key: string, value: string) {
      await storage.set(key, value)
    },
    async removeItem(key: string) {
      await storage.remove(key)
    },
  }
}

function createLocalStorageDriver(): StorageDriver | null {
  if (typeof window === 'undefined') return null
  if (!('localStorage' in window)) return null
  try {
    const testKey = '__moyu_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
  } catch (error) {
    console.warn('[StorageService] localStorage unavailable.', error)
    return null
  }

  return {
    async getItem(key) {
      const value = window.localStorage.getItem(key)
      return value ?? null
    },
    async setItem(key, value) {
      window.localStorage.setItem(key, value)
    },
    async removeItem(key) {
      window.localStorage.removeItem(key)
    },
  }
}

async function initializeDriver() {
  const windowDriver = createWindowDriver()
  if (windowDriver) {
    try {
      await windowDriver.setItem('__moyu__ping__', '1')
      await windowDriver.removeItem('__moyu__ping__')
      driver = windowDriver
      return
    } catch (error) {
      console.warn('[StorageService] window.storage unusable, trying localStorage.', error)
    }
  }

  const localStorageDriver = createLocalStorageDriver()
  if (localStorageDriver) {
    driver = localStorageDriver
    return
  }

  driver = memoryDriver
}

const readyPromise = initializeDriver()

function buildKey(namespace: StorageNamespace, identifier: string) {
  return `${namespace}:${identifier}`
}

export const StorageService = {
  async ready() {
    await readyPromise
  },

  async getObject<T>(namespace: StorageNamespace, identifier: string): Promise<T | null> {
    await readyPromise
    const key = buildKey(namespace, identifier)
    const raw = await driver.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  },

  async setObject(namespace: StorageNamespace, identifier: string, value: unknown) {
    await readyPromise
    const key = buildKey(namespace, identifier)
    await driver.setItem(key, JSON.stringify(value))
  },

  async remove(namespace: StorageNamespace, identifier: string) {
    await readyPromise
    const key = buildKey(namespace, identifier)
    await driver.removeItem(key)
  },
}

