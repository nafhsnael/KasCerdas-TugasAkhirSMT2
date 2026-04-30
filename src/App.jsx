import { useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypePage from './pages/UserTypePage'
import DompetPage from './pages/DompetPage'
import InitialBalancePage from './pages/InitialBalancePage'
//import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
//import ReportsPage from './pages/ReportsPage'
//import BudgetPage from './pages/BudgetPage'
import ProfilePage from './pages/ProfilePage'
import { transactions as initialTransactions, budgets, reports, walletSummary } from './utils/data'

const pages = {
  //dashboard: 'Dashboard',
  transactions: 'Transaksi',
  //reports: 'Laporan',
  //budget: 'Budget',
  profile: 'Profil',
  login: 'Login',
  register: 'Register',
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserType, setShowUserType] = useState(false)
  const [userType, setUserType] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showInitialBalance, setShowInitialBalance] = useState(false)
  const [initialBalance, setInitialBalance] = useState(0)
  const [filters, setFilters] = useState({ type: 'all' })
  const [transactions, setTransactions] = useState(initialTransactions)
  const [userProfile, setUserProfile] = useState({
    nama: 'nafhisa naila',
    email: 'Naila@email.com',
    user: 'Nafhsnael',
    usertype: null,
    dompet: null,
    profileImage: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80',
  })

  const addTransaction = (newTransaction) => {
    const transaction = {
      id: `t${Date.now()}`,
      ...newTransaction,
    }
    setTransactions((prev) => [transaction, ...prev])
  }

  const handleAuthenticate = (isRegister = false) => {
    setIsAuthenticated(true)
    if (isRegister) {
      setShowUserType(true)
    } else {
      setCurrentPage('transactions')
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
    setCurrentPage('transactions')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage('login')
    setUserType(null)
    setWallet(null)
    setShowUserType(false)
    setShowWallet(false)
    setShowInitialBalance(false)
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
        <RegisterPage onSwitch={() => setCurrentPage('login')} onAuthenticate={() => handleAuthenticate(true)} />
      ) : (
        <LoginPage onSwitch={() => setCurrentPage('register')} onAuthenticate={() => handleAuthenticate(false)} />
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
      case 'reports':
        return <ReportsPage reports={reports} />
      case 'budget':
        return <BudgetPage budgets={budgets} />
      case 'profile':
        return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={setCurrentPage} />
      case 'dashboard':
        return (
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900"></h1>
            </div>
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
  }, [currentPage, isAuthenticated, showUserType, showWallet, showInitialBalance, initialBalance, filters, transactions, userProfile])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {isAuthenticated && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            userProfile={userProfile}
            onLogout={handleLogout}
          />
        )}
        <div className="flex-1 flex flex-col">
          {isAuthenticated && (
            <div className="p-4 md:p-6 lg:p-8">
              <TopBar currentPage={pages[currentPage] || currentPage} />
            </div>
          )}
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mt-6">
              {pageComponent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
