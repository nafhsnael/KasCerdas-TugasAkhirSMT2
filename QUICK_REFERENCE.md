# 🚀 Quick Start for Developers

**Last Updated:** May 25, 2026

---

## ⚡ 30-Second Setup

```bash
# Terminal 1: Backend
cd backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Frontend
npm install
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:8000

---

## 📌 API Service Quick Reference

```javascript
import { 
  authAPI, 
  transactionAPI, 
  budgetAPI, 
  debtAPI, 
  savingAPI 
} from './utils/api'

// Create Debt
await debtAPI.create({
  wallet_id: 1,
  creditor_name: 'Bank BCA',
  amount: 5000000,
  due_date: '2026-06-25',
  note: 'Cicilan'
})

// List Savings
const savings = await savingAPI.list({ status: 'active' })

// Update Budget
await budgetAPI.update(id, { limit: 2000000 })

// Deposit to Savings
await savingAPI.deposit(savingId, 500000)
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/utils/api.js` | All API methods |
| `FRONTEND_API_INTEGRATION_GUIDE.md` | How to integrate |
| `BACKEND_IMPLEMENTATION_SUMMARY.md` | Backend details |
| `COMPLETION_REPORT.md` | Full summary |

---

## 🔌 API Endpoints

### Debts
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/debts` | List debts |
| POST | `/api/debts` | Create debt |
| GET | `/api/debts/{id}` | Get debt |
| PUT | `/api/debts/{id}` | Update debt |
| DELETE | `/api/debts/{id}` | Delete debt |

### Savings
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/savings` | List savings |
| POST | `/api/savings` | Create saving |
| GET | `/api/savings/{id}` | Get saving |
| PUT | `/api/savings/{id}` | Update saving |
| DELETE | `/api/savings/{id}` | Delete saving |
| POST | `/api/savings/{id}/deposit` | Add to savings |
| POST | `/api/savings/{id}/withdraw` | Withdraw |

### Budgets (NEW)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/budgets/{id}` | Get budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

---

## 🔐 Auth Header

All requests automatically include:
```
Authorization: Bearer {token}
```

Token is auto-added from localStorage if present.

---

## 📋 Integration Checklist

- [ ] Backend running (`php artisan serve`)
- [ ] Frontend running (`npm run dev`)
- [ ] Can login successfully
- [ ] AddDebtPage calls backend
- [ ] AddSavingsPage calls backend
- [ ] BudgetPage can update/delete
- [ ] ReportsPage shows real data
- [ ] All pages using api.js

---

## 🧪 Quick Test

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create Debt (replace TOKEN)
curl -X POST http://localhost:8000/api/debts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "creditor_name": "Bank",
    "amount": 5000000,
    "due_date": "2026-06-25"
  }'

# List Debts
curl -X GET http://localhost:8000/api/debts \
  -H "Authorization: Bearer TOKEN"
```

---

## 📚 Full Documentation

Read in this order:
1. This file (you are here)
2. `FRONTEND_API_INTEGRATION_GUIDE.md`
3. `BACKEND_IMPLEMENTATION_SUMMARY.md`
4. `COMPLETION_REPORT.md`

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 404 on `/api/debts` | Backend not running |
| CORS error | Check Vite proxy in `vite.config.js` |
| 401 Unauthorized | Token not in localStorage |
| Can't create debt | Check `wallet_id` is valid |

---

## ✅ What's New

✨ **Fully Implemented:**
- Debt Management (5 endpoints)
- Savings Management (7 endpoints)
- Budget CRUD (3 new endpoints)
- API Service Utility
- Security hardening

---

## 🚀 You're Ready!

Everything is set up. Start developing! 🎉
