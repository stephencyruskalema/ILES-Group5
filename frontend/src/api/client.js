import axios from 'axios'

// Direct connection string to your local running Django development instance
const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || LOCAL_BACKEND_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // This is the critical addition for session-based authentication
  withCredentials: true, 
})

export async function fetchWorkspace() {
  const [stats, departments, companies, supervisors, students, placements, logs, evaluations, documents, visits] =
    await Promise.all([
      api.get('/api/stats/'),
      api.get('/api/departments/'),
      api.get('/api/companies/'),
      api.get('/api/supervisors/'),
      api.get('/api/students/'),
      api.get('/api/placements/'),
      api.get('/api/logs/'),
      api.get('/api/evaluations/'),
      api.get('/api/documents/'),
      api.get('/api/visits/'),
    ])

  return {
    stats: stats.data,
    departments: departments.data,
    companies: companies.data,
    supervisors: supervisors.data,
    students: students.data,
    placements: placements.data,
    logs: logs.data,
    evaluations: evaluations.data,
    documents: documents.data,
    visits: visits.data,
  }
}

export async function createResource(resource, payload) {
  return api.post(`/api/${resource}/`, payload)
}

export async function patchResource(resource, id, payload) {
  return api.patch(`/api/${resource}/${id}/`, payload)
}

export async function signupAccount(payload) {
  const response = await api.post('/api/auth/signup/', payload)
  return response.data
}

export async function loginAccount(payload) {
  const response = await api.post('/api/auth/login/', payload)
  return response.data
}

export async function logoutAccount() {
  const response = await api.post('/api/auth/logout/')
  return response.data
}