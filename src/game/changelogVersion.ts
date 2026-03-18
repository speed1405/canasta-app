/** Tracks which app version the user last saw the changelog for. */

const CHANGELOG_KEY = 'canasta_changelog_seen'

/** The current app version — bump this string with each release to trigger the modal. */
export const CURRENT_VERSION = '1.1.0'

/** Returns true when the user has not yet seen the changelog for CURRENT_VERSION. */
export function shouldShowChangelog(): boolean {
  try {
    return localStorage.getItem(CHANGELOG_KEY) !== CURRENT_VERSION
  } catch {
    return false
  }
}

/** Persist that the user has seen the changelog for CURRENT_VERSION. */
export function markChangelogSeen(): void {
  try {
    localStorage.setItem(CHANGELOG_KEY, CURRENT_VERSION)
  } catch {
    // ignore
  }
}
