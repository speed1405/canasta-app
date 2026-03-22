import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LearnList } from '../../pages/LearnList'
import { clearLessonProgress, markLessonComplete } from '../../game/learnProgress'
import { LESSONS } from '../../game/lessons'

function renderLearnList() {
  return render(
    <MemoryRouter>
      <LearnList />
    </MemoryRouter>,
  )
}

describe('LearnList', () => {
  beforeEach(() => {
    clearLessonProgress()
  })

  it('renders the Learn heading', () => {
    renderLearnList()
    expect(screen.getByText('Learn')).toBeTruthy()
  })

  it('renders all lesson titles', () => {
    renderLearnList()
    for (const lesson of LESSONS) {
      expect(screen.getByText(lesson.title)).toBeTruthy()
    }
  })

  it('shows 0 of N completed when no lessons are done', () => {
    renderLearnList()
    expect(screen.getByText(new RegExp(`0 of ${LESSONS.length} lessons completed`, 'i'))).toBeTruthy()
  })

  it('shows progress when a lesson is completed', () => {
    markLessonComplete('intro')
    renderLearnList()
    expect(screen.getByText(new RegExp(`1 of ${LESSONS.length} lessons completed`, 'i'))).toBeTruthy()
  })

  it('shows completed badge on a done lesson', () => {
    markLessonComplete('dealing')
    renderLearnList()
    // The completed badge should have aria-label "Completed"
    const badges = screen.getAllByLabelText('Completed')
    expect(badges.length).toBe(1)
  })

  it('links to each lesson', () => {
    renderLearnList()
    const firstLesson = LESSONS[0]
    const link = screen.getByRole('link', { name: new RegExp(firstLesson.title, 'i') })
    expect(link.getAttribute('href')).toBe(`/learn/${firstLesson.id}`)
  })

  it('shows a progress bar', () => {
    renderLearnList()
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })
})
