/**
 * API Service Utility
 * Handles all API calls to the backend with proper headers and error handling
 */

const API_BASE_URL = 'https://backend-kascerdas-production.up.railway.app/api';

/**
 * Generic fetch wrapper with authentication
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  
  const authlessRoutes = ['/auth/login', '/auth/register']
  const baseEndpoint = endpoint.split('?')[0].toLowerCase()
  if (!token && !authlessRoutes.includes(baseEndpoint)) {
    const error = new Error('Token autentikasi tidak ditemukan. Silakan login ulang.')
    error.status = 401
    throw error
  }
  
  const headers = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {}),
  }

  // Kalau body berupa FormData/file upload, JANGAN set Content-Type manual.
  // Browser akan otomatis membuat multipart/form-data lengkap dengan boundary.
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  const data = await response.json().catch(() => null)

    // Maintenance mode (503) should be treated as a silent success
    if (response.status === 503) {
      return {};
    }

    if (!response.ok) {
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      const message = firstError || data?.message || `API request failed (${response.status} ${response.statusText})`;
      const error = new Error(message);
      error.status = response.status;
      error.responseData = data;
      throw error;
    }

  return data
}

function hasReceiptFile(payload = {}) {
  return typeof File !== 'undefined' && payload.receipt instanceof File
}

function transactionToFormData(payload = {}) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (key === 'receipt') {
      if (typeof File !== 'undefined' && value instanceof File) {
        formData.append('receipt', value)
      }
      return
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
      return
    }

    formData.append(key, value)
  })

  return formData
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

  // FIX: Fetch ALL pages of transactions for initial load after login
  listAll: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'fetchAll') {
        params.append(key, value)
      }
    })
    
    // Start with limit=100 (max allowed by backend) and page 1
    const allTransactions = []
    let currentPage = 1
    let lastPage = 1
    
    try {
      while (currentPage <= lastPage) {
        const pageParams = new URLSearchParams(params)
        pageParams.set('limit', '100')
        pageParams.set('page', currentPage.toString())
        const queryString = pageParams.toString()
        const url = queryString ? `/transactions?${queryString}` : '/transactions'
        
        const response = await apiFetch(url, { method: 'GET' })
        
        if (response.data && Array.isArray(response.data)) {
          allTransactions.push(...response.data)
        }
        
        // Update pagination info from response meta
        if (response.meta) {
          lastPage = response.meta.last_page || 1
        }
        
        currentPage++
      }
      
      // Return in the same format as list() for consistency
      return {
        success: true,
        data: allTransactions,
        meta: {
          total: allTransactions.length,
          per_page: 100,
          current_page: 1,
          last_page: 1,
        }
      }
    } catch (e) {
      console.error('Error fetching all transactions:', e)
      throw e
    }
  },
  
  summary: () =>
    apiFetch('/transactions/summary', { method: 'GET' }),
  
  get: (id) =>
    apiFetch(`/transactions/${id}`, { method: 'GET' }),
  
  create: (payload) => {
    const body = hasReceiptFile(payload) ? transactionToFormData(payload) : JSON.stringify(payload)

    return apiFetch('/transactions', {
      method: 'POST',
      body,
    })
  },
  
  update: (id, payload) => {
    const withFile = hasReceiptFile(payload)
    const body = withFile
      ? transactionToFormData({ ...payload, _method: 'PUT' })
      : JSON.stringify(payload)

    return apiFetch(`/transactions/${id}`, {
      method: withFile ? 'POST' : 'PUT',
      body,
    })
  },
  
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
