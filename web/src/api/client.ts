import axios from 'axios'

/**
 * Axios instance — MERN stack, Netlify + Render deployment.
 *
 * How URLs work:
 *   Local dev  → Vite proxy  (/api → localhost:8000)
 *   Production → Netlify proxy (/api → Render backend via _redirects)
 *
 * In both cases the browser always calls relative '/api' — no hardcoded
 * backend URL needed, and CORS is never an issue.
 */

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// On 401 → clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
