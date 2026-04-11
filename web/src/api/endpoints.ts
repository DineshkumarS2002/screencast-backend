/**
 * API methods for authentication and video operations.
 */

import api from './client'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  email: string
}

export interface Video {
  id: number
  user: User
  title: string
  file_url: string
  thumbnail: string | null
  duration: number
  file_size: number
  mime_type: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
  message?: string
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (username: string, email: string, password: string, password2: string) =>
    api.post<AuthResponse>('/auth/register/', { username, email, password, password2 }),

  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login/', { username, password }),

  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }),

  me: () =>
    api.get<User>('/auth/me/'),

  updateProfile: (data: Partial<Pick<User, 'username' | 'email'>>) =>
    api.put<User>('/auth/profile/', data),

  changePassword: (old_password: string, new_password: string, confirm_password: string) =>
    api.post('/auth/password/', { old_password, new_password, confirm_password }),
}

// ─── Videos ─────────────────────────────────────────────────────────────────

export const videoApi = {
  /**
   * Upload a video blob as multipart form data.
   * @param blob       The recorded video Blob
   * @param title      Optional title for the recording
   * @param duration   Duration in seconds
   * @param onProgress Upload progress callback (0–100)
   */
  upload: (
    blob: Blob,
    title: string,
    duration: number,
    onProgress?: (pct: number) => void,
    thumbnail?: Blob
  ) => {
    const form = new FormData()
    const filename = `recording-${Date.now()}.webm`
    form.append('file', blob, filename)
    form.append('title', title || 'Untitled Recording')
    form.append('duration', String(duration))
    form.append('mime_type', blob.type || 'video/webm')
    if (thumbnail) {
      form.append('thumbnail', thumbnail, 'thumb.jpg')
    }

    return api.post<{ message: string; video: Video }>('/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress) {
          onProgress(Math.round((evt.loaded / evt.total) * 100))
        }
      },
    })
  },

  list: () =>
    api.get<{ results: Video[]; count: number }>('/videos/'),

  getById: (id: number) =>
    api.get<Video>(`/videos/${id}/`),

  delete: (id: number) =>
    api.delete(`/videos/${id}/`),
}
