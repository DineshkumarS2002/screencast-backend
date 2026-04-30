import axios from 'axios'

/**
 * Senior API Client Configuration
 * 
 * Strategy: 
 *   We use relative paths ('/api') to leverage the Netlify/Vite proxy.
 *   This avoids CORS issues and ensures the browser treats the API as same-origin.
 */

const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
                   (window.location.port === '5173' || window.location.port === '3000');

const baseURL = isLocalDev
  ? '/api'
  : 'https://screencast-backend-1.onrender.com/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Response interceptor: global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // On 401 (Unauthorized) -> clear session
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
