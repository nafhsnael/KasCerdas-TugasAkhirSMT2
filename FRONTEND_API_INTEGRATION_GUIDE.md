# 🔌 Frontend-Backend Integration Guide

**Date:** May 25, 2026  
**Status:** Ready for Integration

---

## 📌 Overview

The frontend is now fully equipped to communicate with the backend API. A comprehensive API service utility has been created to simplify all API calls.

---

## 🚀 Quick Start

### 1. API Service Utility

**Location:** `src/utils/api.js`

The API service provides organized methods for all backend endpoints:

```javascript
import { 
  authAPI, 
  transactionAPI, 
  budgetAPI, 
  debtAPI, 
  savingAPI 
} from './utils/api'
```

### 2. Key Features

✅ **Automatic Token Management** - Includes Bearer token in all requests  
✅ **Error Handling** - Throws errors with meaningful messages  
✅ **Query Parameter Support** - Handles filters automatically  
✅ **Base URL Configuration** - Uses `/api` proxy or environment variable  

---

## 📚 API Usage Examples

### Authentication

```javascript
import { authAPI } from './utils/api'

// Login
const loginResponse = await authAPI.login('user@example.com', 'password')
localStorage.setItem('token', loginResponse.data.token)

// Get Current User
const currentUser = await authAPI.me()

// Logout
await authAPI.logout()
```

### Transactions

```javascript
import { transactionAPI } from './utils/api'

// List transactions with filters
const transactions = await transactionAPI.list({
  from: '2026-05-01',
  to: '2026-05-31',
  type: 'expense',
  category: 'Makan'
})

// Create transaction
const newTx = await transactionAPI.create({
  wallet_id: 1,
  title: 'Makan siang',
  category: 'Makan',
  amount: 45000,
  date: '2026-05-25',
  type: 'expense',
  note: 'Nasi ayam geprek'
})

// Update transaction
await transactionAPI.update(txId, {
  title: 'Updated title',
  amount: 50000
})

// Delete transaction
await transactionAPI.delete(txId)
```

### Budgets

```javascript
import { budgetAPI } from './utils/api'

// List budgets for a specific month
const budgets = await budgetAPI.list('2026-05')

// Create budget
const budget = await budgetAPI.create({
  wallet_id: 1,
  period_month: '2026-05',
  category: 'Makan',
  limit: 1000000
})

// Update budget (NEW - Previously Not Available)
await budgetAPI.update(budgetId, {
  limit: 1200000
})

// Delete budget (NEW - Previously Not Available)
await budgetAPI.delete(budgetId)
```

### Debts

```javascript
import { debtAPI } from './utils/api'

// List all debts
const debts = await debtAPI.list()

// List debts by status
const activeDebts = await debtAPI.list({ status: 'active' })

// Create debt
const debt = await debtAPI.create({
  wallet_id: 1,
  creditor_name: 'Bank BCA',
  amount: 5000000,
  due_date: '2026-06-25',
  note: 'Cicilan mobil'
})

// Update debt
await debtAPI.update(debtId, {
  paid_amount: 500000,
  status: 'active'
})

// Delete debt
await debtAPI.delete(debtId)
```

### Savings

```javascript
import { savingAPI } from './utils/api'

// List all savings goals
const savings = await savingAPI.list()

// List active savings only
const activeSavings = await savingAPI.list({ status: 'active' })

// Create savings goal
const saving = await savingAPI.create({
  wallet_id: 1,
  name: 'Liburan Bali',
  target_amount: 10000000,
  current_amount: 2000000,
  target_date: '2026-12-31',
  category: 'Liburan'
})

// Update savings goal
await savingAPI.update(savingId, {
  name: 'Updated goal name',
  target_amount: 12000000
})

// Add to savings (DEPOSIT)
await savingAPI.deposit(savingId, 500000)

// Withdraw from savings
await savingAPI.withdraw(savingId, 200000)

// Delete savings goal
await savingAPI.delete(savingId)
```

---

## 🔄 Integration Steps for Each Page

### AddDebtPage

**Current:** Uses `onAddDebt` callback with local state  
**To Integrate:**

```javascript
import { debtAPI } from '../utils/api'

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const debt = await debtAPI.create({
      wallet_id: selectedWallet,
      creditor_name: formData.creditor,
      amount: formData.amount,
      due_date: formData.dueDate,
      note: formData.note
    })
    // Show success message
    // Navigate to reports
  } catch (error) {
    setMessage(error.message)
  }
}
```

### AddSavingsPage

**Current:** Uses `onAddSavings` callback with local state  
**To Integrate:**

```javascript
import { savingAPI } from '../utils/api'

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const saving = await savingAPI.create({
      wallet_id: selectedWallet,
      name: formData.name,
      target_amount: formData.target,
      current_amount: formData.current,
      target_date: formData.deadline,
      note: formData.note
    })
    // Show success message
    // Navigate to reports
  } catch (error) {
    setMessage(error.message)
  }
}
```

### ReportsPage

**Current:** Uses mock data and local calculations  
**To Integrate:**

```javascript
import { transactionAPI, debtAPI, savingAPI } from '../utils/api'

useEffect(() => {
  const fetchData = async () => {
    try {
      const [txns, debts, savings] = await Promise.all([
        transactionAPI.list(),
        debtAPI.list(),
        savingAPI.list()
      ])
      // Use this data instead of props
    } catch (error) {
      console.error(error)
    }
  }
  fetchData()
}, [])
```

### BudgetPage

**Current:** Uses local state (create, view)  
**To Integrate:** Add update & delete

```javascript
import { budgetAPI } from '../utils/api'

// Update budget
const handleUpdateBudget = async (budgetId, newLimit) => {
  try {
    await budgetAPI.update(budgetId, { limit: newLimit })
    // Refresh budget list
  } catch (error) {
    setMessage(error.message)
  }
}

// Delete budget
const handleDeleteBudget = async (budgetId) => {
  try {
    await budgetAPI.delete(budgetId)
    // Remove from local state or refresh
  } catch (error) {
    setMessage(error.message)
  }
}
```

---

## 🔐 Authentication Flow

### Token Management

```javascript
// After successful login
const response = await authAPI.login(email, password)
localStorage.setItem('token', response.data.token)

// Token is automatically included in all subsequent API calls

// On logout
await authAPI.logout()
localStorage.removeItem('token')
```

### Protected Routes

The API service automatically adds the `Authorization: Bearer {token}` header to all requests. If a request returns 401, handle it:

```javascript
try {
  await someAPICall()
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired or invalid
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}
```

---

## 🧪 Testing the API

### Using Postman

**Base URL:** `http://localhost:8000/api`

**Headers:**
```
Authorization: Bearer {your_token}
Content-Type: application/json
Accept: application/json
```

**Examples:**

```bash
# Get list of debts
GET http://localhost:8000/api/debts
Header: Authorization: Bearer {token}

# Create debt
POST http://localhost:8000/api/debts
Body: {
  "wallet_id": 1,
  "creditor_name": "Bank BCA",
  "amount": 5000000,
  "due_date": "2026-06-25",
  "note": "Cicilan mobil"
}

# Update budget
PUT http://localhost:8000/api/budgets/1
Body: {
  "limit": 2000000
}
```

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create debt with token
curl -X POST http://localhost:8000/api/debts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "creditor_name": "Bank BCA",
    "amount": 5000000,
    "due_date": "2026-06-25"
  }'
```

---

## ✅ Checklist for Complete Integration

### Phase 1: Debt Management (AddDebtPage)
- [ ] Import `debtAPI`
- [ ] Update `handleSubmit` to call `debtAPI.create()`
- [ ] Update `handleUpdate` to call `debtAPI.update()`
- [ ] Update `handleDelete` to call `debtAPI.delete()`
- [ ] Test with backend API

### Phase 2: Savings Management (AddSavingsPage)
- [ ] Import `savingAPI`
- [ ] Update `handleSubmit` to call `savingAPI.create()`
- [ ] Add deposit/withdraw functionality
- [ ] Test with backend API

### Phase 3: Budget Enhancements (BudgetPage)
- [ ] Import `budgetAPI`
- [ ] Add update budget handler
- [ ] Add delete budget handler
- [ ] Test with backend API

### Phase 4: Reports Integration (ReportsPage)
- [ ] Import required APIs
- [ ] Replace mock data with API calls
- [ ] Handle loading states
- [ ] Handle error states

### Phase 5: Dashboard Updates
- [ ] Update dashboards to fetch real data
- [ ] Remove mock data
- [ ] Add loading indicators

---

## 🐛 Common Issues & Solutions

### Issue: 404 Not Found on API calls

**Cause:** Backend server not running  
**Solution:** 
```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Issue: CORS Error

**Cause:** API proxy not configured  
**Solution:** Ensure `vite.config.js` has proxy configured:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

### Issue: 401 Unauthorized

**Cause:** Missing or invalid token  
**Solution:** Ensure token is stored in localStorage after login
```javascript
localStorage.setItem('token', response.data.token)
```

### Issue: Request body not received by backend

**Cause:** Missing Content-Type header  
**Solution:** The API service automatically adds this header

---

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data here
  }
}
```

Or for errors:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🔗 API Endpoint Reference

| Feature | Method | Endpoint | Auth Required |
|---------|--------|----------|---|
| **Debts** | GET | `/api/debts` | ✅ |
| | POST | `/api/debts` | ✅ |
| | GET | `/api/debts/{id}` | ✅ |
| | PUT | `/api/debts/{id}` | ✅ |
| | DELETE | `/api/debts/{id}` | ✅ |
| **Savings** | GET | `/api/savings` | ✅ |
| | POST | `/api/savings` | ✅ |
| | GET | `/api/savings/{id}` | ✅ |
| | PUT | `/api/savings/{id}` | ✅ |
| | DELETE | `/api/savings/{id}` | ✅ |
| | POST | `/api/savings/{id}/deposit` | ✅ |
| | POST | `/api/savings/{id}/withdraw` | ✅ |
| **Budgets** | GET | `/api/budgets` | ✅ |
| | POST | `/api/budgets` | ✅ |
| | GET | `/api/budgets/{id}` | ✅ |
| | PUT | `/api/budgets/{id}` | ✅ |
| | DELETE | `/api/budgets/{id}` | ✅ |

---

**Ready to integrate? Start with AddDebtPage and follow the examples above!**
