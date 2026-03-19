import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })))
const LearnList = lazy(() => import('../pages/LearnList').then((m) => ({ default: m.LearnList })))
const LearnLesson = lazy(() => import('../pages/LearnLesson').then((m) => ({ default: m.LearnLesson })))
const PracticeList = lazy(() => import('../pages/PracticeList').then((m) => ({ default: m.PracticeList })))
const PracticeScenario = lazy(() => import('../pages/PracticeScenario').then((m) => ({ default: m.PracticeScenario })))
const PlaySetup = lazy(() => import('../pages/PlaySetup').then((m) => ({ default: m.PlaySetup })))
const PlayGame = lazy(() => import('../pages/PlayGame').then((m) => ({ default: m.PlayGame })))
const Reference = lazy(() => import('../pages/Reference').then((m) => ({ default: m.Reference })))
const Stats = lazy(() => import('../pages/Stats').then((m) => ({ default: m.Stats })))
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })))
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('../pages/Register').then((m) => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })))
const Profile = lazy(() => import('../pages/Profile').then((m) => ({ default: m.Profile })))
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })))
const Lobby = lazy(() => import('../pages/Lobby').then((m) => ({ default: m.Lobby })))
const MultiplayerGame = lazy(() => import('../pages/MultiplayerGame').then((m) => ({ default: m.MultiplayerGame })))
const Tournaments = lazy(() => import('../pages/Tournaments').then((m) => ({ default: m.Tournaments })))
const TournamentView = lazy(() => import('../pages/TournamentView').then((m) => ({ default: m.TournamentView })))
const Leaderboards = lazy(() => import('../pages/Leaderboards').then((m) => ({ default: m.Leaderboards })))
const Replay = lazy(() => import('../pages/Replay').then((m) => ({ default: m.Replay })))
const Challenges = lazy(() => import('../pages/Challenges').then((m) => ({ default: m.Challenges })))
const Spectator = lazy(() => import('../pages/Spectator').then((m) => ({ default: m.Spectator })))

function RouteLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canasta-navy">
      <div className="w-10 h-10 rounded-full border-4 border-canasta-gold border-t-transparent animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoading />}>
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/lobby/:roomId" element={<MultiplayerGame />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentView />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/replay/:gameId" element={<Replay />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/spectator" element={<Spectator />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
