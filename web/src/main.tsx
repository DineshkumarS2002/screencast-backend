import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { RecorderProvider } from './context/RecorderContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <RecorderProvider>
          <App />
        </RecorderProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
)
