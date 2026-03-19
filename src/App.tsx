import { AppRouter } from './router/AppRouter'
import { UpdateBanner } from './components/UpdateBanner'
import { AuthProvider } from './auth/AuthContext'
import { AchievementToast } from './components/AchievementToast'
import { initTheme } from './themes/themeService'

// Apply persisted card theme on startup
initTheme()

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <UpdateBanner />
      <AchievementToast />
    </AuthProvider>
  )
}

export default App
