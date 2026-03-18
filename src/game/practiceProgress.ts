/** Persist and retrieve practice scenario results in localStorage. */

const STORAGE_KEY = 'canasta_practice_results'

export interface ScenarioResult {
  passed: boolean
  attempts: number
}

type ResultsMap = Record<string, ScenarioResult>

/**
 * Returns the full map of scenario results stored in localStorage.
 */
export function getScenarioResults(): ResultsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ResultsMap
    }
    return {}
  } catch {
    return {}
  }
}

/**
 * Returns the result for a single scenario, or undefined if not attempted.
 */
export function getScenarioResult(scenarioId: string): ScenarioResult | undefined {
  return getScenarioResults()[scenarioId]
}

/**
 * Records an attempt for a scenario. Increments the attempt counter and
 * sets passed=true if the answer was correct (pass state is sticky — once
 * passed it remains passed even on subsequent wrong attempts).
 */
export function recordScenarioAttempt(scenarioId: string, passed: boolean): void {
  try {
    const results = getScenarioResults()
    const existing = results[scenarioId]
    results[scenarioId] = {
      passed: passed || (existing?.passed ?? false),
      attempts: (existing?.attempts ?? 0) + 1,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {
    // ignore storage errors
  }
}

/**
 * Clears all practice progress (used in tests).
 */
export function clearPracticeProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
