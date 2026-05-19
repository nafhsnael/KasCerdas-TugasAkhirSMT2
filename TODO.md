# TODO - KasCerdas Backend (Laravel + Sanctum) + FE Integration

> Track progress in this file.

## Auth (Sanctum) — BE & FE
- [x] Fix backend Sanctum token creation (User model must use HasApiTokens)

- [x] Add `/api/auth/me` usage from FE after login/register
- [x] Implement FE API calls for register/login using Axios/fetch
- [x] Persist token in FE and attach `Authorization: Bearer <token>` to protected requests

## Database & Minimal API (Wallet + Transactions + Budgets)
- [ ] Update migrations for `wallets`, `transactions`, `budgets` (fields + relations)
- [ ] Run migrations + ensure schema exists
- [ ] Add models relations (User<->Wallet, Wallet<->Transaction, Wallet<->Budget)
- [ ] Create API controllers:
  - [ ] Wallet: create/list + initial balance (minimal)
  - [ ] Transactions: list/filter/create/delete (minimal)
  - [ ] Budgets: create/list by period_month (minimal)
- [ ] Register routes in `backend/routes/api.php`

## Seeders & Testing
- [ ] Add seeder dummy wallet/transactions/budgets
- [ ] Smoke test via FE pages: login -> set wallet -> add/view transactions & budgets

