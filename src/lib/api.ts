import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrinex_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agrinex_token')
      localStorage.removeItem('agrinex_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
