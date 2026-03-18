/** Persist and retrieve lesson completion state in localStorage. */

const STORAGE_KEY = 'canasta_lessons_completed'

/**
 * Returns the set of lesson IDs that the user has completed.
 */
export function getCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set<string>(parsed)
    return new Set()
  } catch {
    return new Set()
  }
}

/**
 * Marks a lesson as completed and persists to localStorage.
 */
export function markLessonComplete(lessonId: string): void {
  try {
    const completed = getCompletedLessons()
    completed.add(lessonId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
  } catch {
    // ignore storage errors
  }
}

/**
 * Returns true if the given lesson has been completed.
 */
export function isLessonComplete(lessonId: string): boolean {
  return getCompletedLessons().has(lessonId)
}

/**
 * Clears all lesson completion state (used in tests).
 */
export function clearLessonProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
