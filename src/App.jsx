import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypePage from './pages/UserTypePage'
import DompetPage from './pages/DompetPage'
import InitialBalancePage from './pages/InitialBalancePage'
import AnalysisPage from './pages/AnalysisPage'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import BudgetPage from './pages/BudgetPage'
import AddDebtPage from './pages/AddDebtPage'
import AddSavingsPage from './pages/AddSavingsPage'
import ProfilePage from './pages/ProfilePage'
import { transactions as initialTransactions } from './utils/data'

const routeToPage = {
  '': 'dashboard',
  login: 'login',
  register: 'register',
  transactions: 'transactions',
  analysis: 'analysis',
  profile: 'profile',
  dashboard: 'dashboard',
  reports: 'reports',
  budget: 'budget',
}

const pathToPage = (path) => {
  const trimmed = path.replace(/^\/+|\/+$/g, '')
  return routeToPage[trimmed] || 'dashboard'
}

const pageToPath = (page) => {
  if (page === 'dashboard') return '/'
  return `/${page}`
}

const pages = {
  dashboard: 'Dashboard',
  transactions: 'Transaksi',
  reports: 'Laporan',
  budget: 'Budget',
  profile: 'Profil',
  login: 'Login',
  register: 'Register',
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard'
    return pathToPage(window.location.pathname)
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('token')
  })
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token))
  const [authLoading, setAuthLoading] = useState(Boolean(token))
  const [showUserType, setShowUserType] = useState(false)
  const [userType, setUserType] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)
  const [showInitialBalance, setShowInitialBalance] = useState(false)
  const [initialBalance, setInitialBalance] = useState(0)
  const [filters, setFilters] = useState({ type: 'all' })
  const [transactions, setTransactions] = useState(initialTransactions)
  const [debts, setDebts] = useState([
    { id: 'd1', creditor: 'Keluarga', amount: 3000000, dueDate: '2026-06-30', status: 'ongoing', note: 'Hutang untuk keperluan keluarga', createdAt: '2026-04-01T00:00:00.000Z' },
    { id: 'd2', creditor: 'Teman', amount: 800000, dueDate: '2026-05-15', status: 'ongoing', note: 'Pinjaman untuk modal usaha', createdAt: '2026-04-01T00:00:00.000Z' },
  ])
  const [savings, setSavings] = useState([
    { id: 's1', name: 'Tabungan Rumah', target: 50000000, current: 21000000, deadline: '2026-12-31', status: 'active', note: 'Target tabungan untuk DP rumah', createdAt: '2026-04-01T00:00:00.000Z' },
  ])
  const [userProfile, setUserProfile] = useState({
    nama: 'Veloura',
    email: 'Naila@email.com',
    user: 'Nafhsnael',
    usertype: null,
    dompet: null,
    profileImage: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80',
  })

  const navigateTo = (page, replace = false) => {
    const path = pageToPath(page)
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState(null, '', path)
      } else {
        window.history.pushState(null, '', path)
      }
    }
    setCurrentPage(page)
  }

  useEffect(() => {
    const onPop = () => {
      setCurrentPage(pathToPage(window.location.pathname))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!token) return

    setAuthLoading(true)
    Promise.all([fetchCurrentUser(), fetchWalletInfo()])
      .then(([authUser, walletData]) => {
        setUserProfile(prev => ({
          ...prev,
          nama: authUser.name || prev.nama,
          user: authUser.username || prev.user,
          email: authUser.email || prev.email,
          usertype: authUser.role || prev.usertype,
          dompet: walletData?.name || prev.dompet,
        }))
        setWalletInfo(walletData)
        setIsAuthenticated(true)
      })
      .catch(() => {
        handleLogout()
      })
      .finally(() => {
        setAuthLoading(false)
      })

  }, [token])

  useEffect(() => {
    if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'register') {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/login')
      }
      setCurrentPage('login')
      return
    }

    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/')
      }
      setCurrentPage('dashboard')
    }
  }, [currentPage, isAuthenticated])

  const addTransaction = (newTransaction) => {
    const transaction = {
      id: `t${Date.now()}`,
      ...newTransaction,
    }
    setTransactions((prev) => [transaction, ...prev])
  }

  const addDebt = (newDebt) => {
    setDebts((prev) => [...prev, newDebt])
  }

  const addSavings = (newSavings) => {
    setSavings((prev) => [...prev, newSavings])
  }

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  const fetchCurrentUser = async () => {
    const res = await authFetch('/api/auth/me', { method: 'GET' })

    if (!res.ok) {
      throw new Error('Gagal mengambil profil user')
    }

    const json = await res.json()
    return json.data
  }

  const fetchWalletInfo = async () => {
    const res = await authFetch('/api/wallet/me', { method: 'GET' })
    if (!res.ok) {
      throw new Error('Gagal mengambil data wallet')
    }

    const json = await res.json()
    return json.data
  }

  const handleAuthenticate = async (userData = {}, isRegister = false) => {
    const newToken = userData?.token

    if (!newToken) {
      alert(userData?.message || 'Autentikasi gagal: token tidak ditemukan')
      setIsAuthenticated(false)
      return
    }

    setToken(newToken)
    try {
      window.localStorage.setItem('token', newToken)
    } catch (e) {
      // ignore
    }

    if (userData.username || userData.email || userData.name || userData.role) {
      setUserProfile(prev => ({
        ...prev,
        nama: userData.name || prev.nama,
        user: userData.username || prev.user,
        email: userData.email || prev.email,
        usertype: userData.role || prev.usertype,
        dompet: prev.dompet,
      }))
    }

    setIsAuthenticated(true)

    if (isRegister) {
      setShowUserType(true)
    } else {
      navigateTo('dashboard')
    }
  }


  const handleUserTypeNext = (selectedUserType) => {
    setUserType(selectedUserType)
    setShowUserType(false)
    setShowWallet(true)
  }

  const handleWalletNext = (selectedWallet) => {
    setWallet(selectedWallet)
    setShowWallet(false)
    setShowInitialBalance(true)
    setUserProfile(prev => ({ ...prev, usertype: userType, dompet: selectedWallet }))
  }

  const handleSaveInitialBalance = (data) => {
    setInitialBalance(data.balance)
    setShowInitialBalance(false)
    navigateTo('dashboard')
  }

  const handleLogout = async () => {
    if (token) {
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    }

    setToken(null)
    setIsAuthenticated(false)
    navigateTo('login')
    setUserType(null)
    setWallet(null)
    setWalletInfo(null)
    setShowUserType(false)
    setShowWallet(false)
    setShowInitialBalance(false)

    try {
      window.localStorage.removeItem('token')
    } catch (e) {
      // ignore
    }
  }

  const pageComponent = useMemo(() => {
    if (isAuthenticated && showUserType) {
      return <UserTypePage onNext={handleUserTypeNext} />
    }

    if (isAuthenticated && showWallet) {
      return <DompetPage onNext={handleWalletNext} />
    }

    if (showInitialBalance) {
      return <InitialBalancePage onSave={handleSaveInitialBalance} initialBalance={initialBalance} />
    }

    if (!isAuthenticated) {
      return currentPage === 'register' ? (
        <RegisterPage onSwitch={() => navigateTo('login')} onAuthenticate={(data) => handleAuthenticate(data, true)} />
      ) : (
        <LoginPage onSwitch={() => navigateTo('register')} onAuthenticate={(data) => handleAuthenticate(data, false)} />
      )
    }

    switch (currentPage) {
      case '':
        return (
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900"> </h1>
            </div>
          </div>
        )
      case 'transactions':
        return <TransactionsPage transactions={transactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
      case 'analysis':
        return <AnalysisPage transactions={transactions} />
      case 'reports':
        return <ReportsPage transactions={transactions} debts={debts} savings={savings} onNavigate={setCurrentPage} />
      case 'budget':
        return <BudgetPage transactions={transactions} />
      case 'add-debt':
        return <AddDebtPage onAddDebt={addDebt} onNavigate={setCurrentPage} />
      case 'add-savings':
        return <AddSavingsPage onAddSavings={addSavings} onNavigate={setCurrentPage} />
      case 'profile':
        return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={setCurrentPage} />
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Selamat Datang di Dashboard</h1>
              <p className="text-slate-600 mt-2">Kelola keuangan Anda dengan mudah dan efisien.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Total Transaksi</h3>
                <p className="text-3xl font-bold text-[#38ADA9] mt-2">{transactions.length}</p>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Pemasukan</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  Rp {transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Pengeluaran</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  Rp {transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
            {walletInfo && (
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Dompet Terhubung</h3>
                <p className="mt-2 text-slate-700">{walletInfo.name}</p>
                <p className="mt-1 text-slate-500">Saldo: Rp {Number(walletInfo.balance).toLocaleString()}</p>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900"></h1>
            </div>
          </div>
        )
    }
  }, [currentPage, isAuthenticated, showUserType, showWallet, showInitialBalance, initialBalance, filters, transactions, debts, savings, userProfile, walletInfo])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isAuthenticated && !showUserType && !showWallet && !showInitialBalance && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => navigateTo(page)}
          userProfile={userProfile}
          onLogout={handleLogout}
        />
      )}
      <div className={`flex-1 flex flex-col ${isAuthenticated && !showUserType && !showWallet && !showInitialBalance ? 'ml-64' : ''}`}>
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mt-6">
            {pageComponent}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
