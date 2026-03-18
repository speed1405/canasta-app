const ONBOARDING_KEY = 'canasta_onboarding_done'

/** Mark onboarding as completed in localStorage. */
export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    // ignore
  }
}

/** Has the user already seen the onboarding? */
export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}
