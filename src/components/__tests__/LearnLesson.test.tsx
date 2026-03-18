import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LearnLesson } from '../../pages/LearnLesson'
import { clearLessonProgress, isLessonComplete, markLessonComplete } from '../../game/learnProgress'
import { LESSONS } from '../../game/lessons'

function renderLesson(lessonId: string) {
  return render(
    <MemoryRouter initialEntries={[`/learn/${lessonId}`]}>
      <Routes>
        <Route path="/learn/:lessonId" element={<LearnLesson />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LearnLesson', () => {
  beforeEach(() => {
    clearLessonProgress()
  })

  const firstLesson = LESSONS[0] // intro
  const lastLesson = LESSONS[LESSONS.length - 1] // scoring

  it('renders the first step of a lesson', () => {
    renderLesson(firstLesson.id)
    expect(screen.getByText(firstLesson.steps[0].title)).toBeTruthy()
  })

  it('shows "Lesson not found" for an unknown lessonId', () => {
    renderLesson('unknown-id')
    expect(screen.getByText(/Lesson not found/i)).toBeTruthy()
  })

  it('renders a progress bar', () => {
    renderLesson(firstLesson.id)
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('navigates to next step when Next is clicked', () => {
    renderLesson(firstLesson.id)
    const nextBtn = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn)
    expect(screen.getByText(firstLesson.steps[1].title)).toBeTruthy()
  })

  it('navigates back to previous step when Previous is clicked', () => {
    renderLesson(firstLesson.id)
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }))
    expect(screen.getByText(firstLesson.steps[0].title)).toBeTruthy()
  })

  it('reaches the quiz after stepping through all steps', () => {
    renderLesson(firstLesson.id)
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount - 1; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    }
    // Last step button should say "Take the Quiz"
    expect(screen.getByRole('button', { name: /Take the Quiz/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Take the Quiz/i }))
    // Quiz question is now shown
    expect(screen.getByText(firstLesson.quiz.question)).toBeTruthy()
  })

  it('shows correct answer feedback when right option selected', () => {
    renderLesson(firstLesson.id)
    // Jump to quiz
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    const correctText = firstLesson.quiz.options[firstLesson.quiz.correctIndex].text
    fireEvent.click(screen.getByText(correctText))
    expect(screen.getByText(/Correct!/i)).toBeTruthy()
  })

  it('shows incorrect feedback when wrong option selected', () => {
    renderLesson(firstLesson.id)
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    // Pick a wrong option (index 0 if correct is not 0, else index 1)
    const wrongIndex = firstLesson.quiz.correctIndex === 0 ? 1 : 0
    const wrongText = firstLesson.quiz.options[wrongIndex].text
    fireEvent.click(screen.getByText(wrongText))
    expect(screen.getByText(/Not quite/i)).toBeTruthy()
  })

  it('marks lesson complete in localStorage after correct answer', () => {
    renderLesson(firstLesson.id)
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    const correctText = firstLesson.quiz.options[firstLesson.quiz.correctIndex].text
    fireEvent.click(screen.getByText(correctText))
    expect(isLessonComplete(firstLesson.id)).toBe(true)
  })

  it('shows "Next lesson" button after correct answer (not on last lesson)', () => {
    renderLesson(firstLesson.id)
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    const correctText = firstLesson.quiz.options[firstLesson.quiz.correctIndex].text
    fireEvent.click(screen.getByText(correctText))
    expect(screen.getByRole('button', { name: /Next lesson/i })).toBeTruthy()
  })

  it('shows completion badge if lesson was previously completed', () => {
    markLessonComplete(firstLesson.id)
    renderLesson(firstLesson.id)
    expect(screen.getByText(/You have completed this lesson/i)).toBeTruthy()
  })

  it('shows "All lessons complete" link after answering last lesson quiz correctly', () => {
    renderLesson(lastLesson.id)
    const stepCount = lastLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    const correctText = lastLesson.quiz.options[lastLesson.quiz.correctIndex].text
    fireEvent.click(screen.getByText(correctText))
    expect(screen.getByText(/All lessons complete/i)).toBeTruthy()
  })

  it('shows Try again button after incorrect answer', () => {
    renderLesson(firstLesson.id)
    const stepCount = firstLesson.steps.length
    for (let i = 0; i < stepCount; i++) {
      const nextBtn = screen.queryByRole('button', { name: /Next|Take the Quiz/i })
      if (nextBtn) fireEvent.click(nextBtn)
    }
    const wrongIndex = firstLesson.quiz.correctIndex === 0 ? 1 : 0
    fireEvent.click(screen.getByText(firstLesson.quiz.options[wrongIndex].text))
    expect(screen.getByRole('button', { name: /Try again/i })).toBeTruthy()
  })
})
