import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypePage from './pages/UserTypePage'
import DompetPage from './pages/DompetPage'
import InitialBalancePage from './pages/InitialBalancePage'
import AnalysisPage from './pages/AnalysisPage'
import TransactionsUMKMPage from './pages/TransactionsUMKMPage'
import TransactionsMahasiswaPage from './pages/TransactionsMahasiswaPage'
import TransactionsMasyarakatPage from './pages/TransactionsMasyarakatPage'
import ReportsPage from './pages/ReportsPage'
import BudgetPage from './pages/BudgetPage'
import DashboardPage from './pages/DashboardPage'
import DashboardMasyarakatPage from './pages/DashboardMasyarakatPage'
import DashboardUMKMPage from './pages/DashboardUMKMPage'
import DashboardMahasiswaPage from './pages/DashboardMahasiswaPage'
import AddDebtPage from './pages/AddDebtPage'
import AddSavingsPage from './pages/AddSavingsPage'
import ProfilePage from './pages/ProfilePage'


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
  const [transactions, setTransactions] = useState([])
  const budgets = []


  const [umkmTransactions, setUmkmTransactions] = useState([])
  const [umkmSummary, setUmkmSummary] = useState({
    income: 0,
    operationalExpense: 0,
    estimatedHpp: 0,
    payables: 0,
    receivables: 0,
    inventory: [],
  })

  const [debts, setDebts] = useState([])

  const [savings, setSavings] = useState([])

  const [userProfile, setUserProfile] = useState({
    nama: '',
    email: '',
    user: '',
    usertype: null,
    dompet: null,
    profileImage: '',
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
          usertype: authUser.user_type || authUser.role || prev.usertype,
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

  const addUmkmTransaction = (newTransaction) => {
    const transaction = {
      id: `t${Date.now()}`,
      ...newTransaction,
      isUmkm: true,
    }

    setTransactions((prev) => [transaction, ...prev])
    setUmkmTransactions((prev) => [transaction, ...prev])

    setUmkmSummary((prevSummary) => {
      const amount = Number(newTransaction.amount) || 0
      const stockQty = Number(newTransaction.stockQty) || 1
      const linkedStock = newTransaction.linkedStock
      const selectedStockId = newTransaction.stockItemId
      const estimatedHpp = Math.round(amount * 0.42)

      const updateInventory = (change) =>
        prevSummary.inventory.map((item) =>
          item.id === selectedStockId
            ? { ...item, stock: Math.max(0, item.stock + change) }
            : item
        )

      let nextSummary = { ...prevSummary }

      switch (newTransaction.businessCategory) {
        case 'Penjualan':
          nextSummary.income += amount
          nextSummary.estimatedHpp += estimatedHpp
          if (linkedStock) {
            nextSummary.inventory = updateInventory(-stockQty)
          }
          break
        case 'Pemasukan Lain':
          nextSummary.income += amount
          break
        case 'Keluar Operasional':
          nextSummary.operationalExpense += amount
          break
        case 'Beli Bahan Baku / Stok':
          nextSummary.inventory = updateInventory(stockQty)
          nextSummary.estimatedHpp += amount
          break
        case 'Piutang Pelanggan':
          if (newTransaction.isSettled) {
            nextSummary.income += amount
          } else {
            nextSummary.receivables += amount
          }
          if (linkedStock) {
            nextSummary.inventory = updateInventory(-stockQty)
            nextSummary.estimatedHpp += estimatedHpp
          }
          break
        case 'Utang Supplier':
          nextSummary.payables += amount
          nextSummary.inventory = updateInventory(stockQty)
          nextSummary.estimatedHpp += amount
          if (newTransaction.isSettled) {
            nextSummary.payables = Math.max(0, nextSummary.payables - amount)
            nextSummary.operationalExpense += amount
          }
          break
        default:
          break
      }

      return nextSummary
    })
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

    if (userData.username || userData.email || userData.name || userData.role || userData.user_type) {
      setUserProfile(prev => ({
        ...prev,
        nama: userData.name || prev.nama,
        user: userData.username || prev.user,
        email: userData.email || prev.email,
        usertype: userData.user_type || userData.role || prev.usertype,
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


  const handleUserTypeNext = async (selectedUserType) => {
    try {
      const res = await authFetch('/api/user/profil', {
        method: 'PUT',
        body: JSON.stringify({
          name: userProfile.nama,
          email: userProfile.email,
          user_type: selectedUserType,
        })
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        alert(errJson?.message || 'Gagal menyimpan tipe pengguna')
        return
      }

      const json = await res.json()
      setUserProfile(prev => ({
        ...prev,
        usertype: json.data.user_type,
      }))
    } catch (e) {
      alert('Terjadi kesalahan koneksi saat menyimpan tipe pengguna')
      return
    }

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
        if (userProfile?.usertype === 'umkm') {
          return (
            <TransactionsUMKMPage
              transactions={umkmTransactions}
              filters={filters}
              setFilters={setFilters}
              onAddUmkmTransaction={addUmkmTransaction}
              umkmSummary={umkmSummary}
            />
          )
        }
        if (userProfile?.usertype === 'mahasiswa') {
          return <TransactionsMahasiswaPage transactions={transactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
        }
        return <TransactionsMasyarakatPage transactions={transactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
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
          userProfile?.usertype === 'mahasiswa' ? (
            <DashboardMahasiswaPage
              walletSummary={{ current: 0, income: 0, expense: 0 }}
              transactions={transactions}
              budgets={[]}

              walletInfo={walletInfo}
              userProfile={userProfile}
            />
          ) : userProfile?.usertype === 'masyarakat' ? (
            <DashboardMasyarakatPage
              walletSummary={{ current: 0, income: 0, expense: 0 }}
              transactions={transactions}
              budgets={[]}

              walletInfo={walletInfo}
              userProfile={userProfile}
            />
          ) : (
            <DashboardPage
              walletSummary={{
                current: Number(walletInfo?.balance ?? 0),
                income: 0,
                expense: 0,
              }}
              transactions={transactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              umkmSummary={umkmSummary}
            />
          )
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
