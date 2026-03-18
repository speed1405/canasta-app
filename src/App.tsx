import { AppRouter } from './router/AppRouter'
import { UpdateBanner } from './components/UpdateBanner'
import { AuthProvider } from './auth/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <UpdateBanner />
    </AuthProvider>
  )
}

export default App
