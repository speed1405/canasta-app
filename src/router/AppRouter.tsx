import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from '../pages/Home'
import { LearnList } from '../pages/LearnList'
import { LearnLesson } from '../pages/LearnLesson'
import { PracticeList } from '../pages/PracticeList'
import { PracticeScenario } from '../pages/PracticeScenario'
import { PlaySetup } from '../pages/PlaySetup'
import { PlayGame } from '../pages/PlayGame'
import { Reference } from '../pages/Reference'
import { Stats } from '../pages/Stats'
import { Settings } from '../pages/Settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<LearnList />} />
        <Route path="/learn/:lessonId" element={<LearnLesson />} />
        <Route path="/practice" element={<PracticeList />} />
        <Route path="/practice/:scenId" element={<PracticeScenario />} />
        <Route path="/play" element={<PlaySetup />} />
        <Route path="/play/game" element={<PlayGame />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
