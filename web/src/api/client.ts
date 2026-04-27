import axios from 'axios'

/**
 * Axios instance with base configuration and auth interceptors.
 * Proxies in vite.config.ts handle routing to http://localhost:8000
 */
const api = axios.create({
  // Use the full Render URL in production if proxying isn't set up, 
  // otherwise use the relative path (handled by _redirects)
  baseURL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : (window.location.hostname === 'localhost' ? '/api' : 'https://screencast-backend-957x.onrender.com/api'),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach access token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor: handle 401s (token refresh logic would go here)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized, could potentially trigger a logout or refresh
    if (error.response?.status === 401) {
      // For now, let the AuthContext handle it or just clear tokens
      // localStorage.removeItem('access_token')
      // localStorage.removeItem('refresh_token')
    }
    return Promise.reject(error)
  }
)

export default api
