/**
 * Client-side feature flag utilities for Disco 3B integration
 * These flags should match the server-side environment variables
 */

export function isDisco3BEnabled(): boolean {
  // In development, you can override these via localStorage for testing
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('ENABLE_DISCO_3B')
    if (override !== null) {
      return override === 'true'
    }
  }
  
  // Default to false for safety - should be enabled via environment variable
  return process.env.NEXT_PUBLIC_ENABLE_DISCO_3B === 'true'
}

export function isDiscoChatEnabled(): boolean {
  // In development, you can override these via localStorage for testing
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('ENABLE_DISCO_CHAT')
    if (override !== null) {
      return override === 'true'
    }
  }
  
  // Default to false for safety - should be enabled via environment variable
  return process.env.NEXT_PUBLIC_ENABLE_DISCO_CHAT === 'true'
}

// Development helpers for testing (only available in dev mode)
export function enableDisco3BForTesting() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.setItem('ENABLE_DISCO_3B', 'true')
    console.log('✅ Disco 3B enabled for testing (localStorage override)')
  }
}

export function enableDiscoChatForTesting() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.setItem('ENABLE_DISCO_CHAT', 'true')
    console.log('✅ Disco Chat enabled for testing (localStorage override)')
  }
}

export function disableDisco3BForTesting() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.setItem('ENABLE_DISCO_3B', 'false')
    console.log('❌ Disco 3B disabled for testing (localStorage override)')
  }
}

export function disableDiscoChatForTesting() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.setItem('ENABLE_DISCO_CHAT', 'false')
    console.log('❌ Disco Chat disabled for testing (localStorage override)')
  }
}

export function clearFeatureFlagOverrides() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.removeItem('ENABLE_DISCO_3B')
    localStorage.removeItem('ENABLE_DISCO_CHAT')
    console.log('🔄 Feature flag overrides cleared - using environment variables')
  }
}