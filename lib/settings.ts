import { kv } from "@vercel/kv"

// Default settings
const DEFAULT_SETTINGS = {
  ALPHABET_LETTERS_COUNT: 8,
  SUBMISSIONS_HALTED: false,
}

// Type for app settings
export type AppSettings = typeof DEFAULT_SETTINGS

/**
 * Get a specific setting from KV storage
 * @param key The setting key
 * @returns The setting value
 */
export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
  try {
    // Try to get the setting from KV
    const value = await kv.get(`settings:${key}`)

    // If the setting doesn't exist, return the default value
    if (value === null) {
      return DEFAULT_SETTINGS[key]
    }

    return value as AppSettings[K]
  } catch (error) {
    console.error(`[SETTINGS] Error getting setting ${key}:`, error)
    // Return default value in case of error
    return DEFAULT_SETTINGS[key]
  }
}

/**
 * Update a setting in KV storage
 * @param key The setting key
 * @param value The new value
 * @returns True if successful
 */
export async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<boolean> {
  try {
    await kv.set(`settings:${key}`, value)
    return true
  } catch (error) {
    console.error(`[SETTINGS] Error updating setting ${key}:`, error)
    return false
  }
}

/**
 * Get all settings
 * @returns All settings
 */
export async function getAllSettings(): Promise<AppSettings> {
  const settings = { ...DEFAULT_SETTINGS }

  try {
    // Get all setting keys
    const keys = Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>

    // Get each setting value
    for (const key of keys) {
      settings[key] = await getSetting(key)
    }

    return settings
  } catch (error) {
    console.error("[SETTINGS] Error getting all settings:", error)
    return DEFAULT_SETTINGS
  }
}

