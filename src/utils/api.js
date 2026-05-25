/**
 * API Service Utility
 * Handles all API calls to the backend with proper headers and error handling
 */

const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  '/api'

/**
 * Generic fetch wrapper with authentication
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  
  return data
}

// ============ AUTHENTICATION ============

export const authAPI = {
  login: (email, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
  
  me: () =>
    apiFetch('/auth/me', { method: 'GET' }),
}

// ============ PROFILE ============

export const profileAPI = {
  get: () =>
    apiFetch('/user/profil', { method: 'GET' }),
  
  update: (payload) =>
    apiFetch('/user/profil', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}

// ============ WALLET ============

export const walletAPI = {
  getMe: () =>
    apiFetch('/wallet/me', { method: 'GET' }),
  
  createOrUpdate: (payload) =>
    apiFetch('/wallets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

// ============ TRANSACTIONS ============

export const transactionAPI = {
  list: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value)
      }
    })
    const queryString = params.toString()
    const url = queryString ? `/transactions?${queryString}` : '/transactions'
    return apiFetch(url, { method: 'GET' })
  },
  
  summary: () =>
    apiFetch('/transactions/summary', { method: 'GET' }),
  
  get: (id) =>
    apiFetch(`/transactions/${id}`, { method: 'GET' }),
  
  create: (payload) =>
    apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  update: (id, payload) =>
    apiFetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  
  delete: (id) =>
    apiFetch(`/transactions/${id}`, { method: 'DELETE' }),
}

// ============ BUDGETS ============

export const budgetAPI = {
  list: (periodMonth) =>
    apiFetch(`/budgets?period_month=${periodMonth}`, { method: 'GET' }),
  
  get: (id) =>
    apiFetch(`/budgets/${id}`, { method: 'GET' }),
  
  create: (payload) =>
    apiFetch('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  update: (id, payload) =>
    apiFetch(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  
  delete: (id) =>
    apiFetch(`/budgets/${id}`, { method: 'DELETE' }),
}

// ============ DEBTS ============

export const debtAPI = {
  list: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value)
      }
    })
    const queryString = params.toString()
    const url = queryString ? `/debts?${queryString}` : '/debts'
    return apiFetch(url, { method: 'GET' })
  },
  
  get: (id) =>
    apiFetch(`/debts/${id}`, { method: 'GET' }),
  
  create: (payload) =>
    apiFetch('/debts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  update: (id, payload) =>
    apiFetch(`/debts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  
  delete: (id) =>
    apiFetch(`/debts/${id}`, { method: 'DELETE' }),
}

// ============ SAVINGS ============

export const savingAPI = {
  list: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value)
      }
    })
    const queryString = params.toString()
    const url = queryString ? `/savings?${queryString}` : '/savings'
    return apiFetch(url, { method: 'GET' })
  },
  
  get: (id) =>
    apiFetch(`/savings/${id}`, { method: 'GET' }),
  
  create: (payload) =>
    apiFetch('/savings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  update: (id, payload) =>
    apiFetch(`/savings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  
  delete: (id) =>
    apiFetch(`/savings/${id}`, { method: 'DELETE' }),
  
  deposit: (id, amount) =>
    apiFetch(`/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  
  withdraw: (id, amount) =>
    apiFetch(`/savings/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
}

export default {
  authAPI,
  profileAPI,
  walletAPI,
  transactionAPI,
  budgetAPI,
  debtAPI,
  savingAPI,
}
