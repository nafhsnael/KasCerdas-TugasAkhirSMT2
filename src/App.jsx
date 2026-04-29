import { useMemo, useState } from 'react'
//import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
//import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
//import ReportsPage from './pages/ReportsPage'
//import BudgetPage from './pages/BudgetPage'
//import ProfilePage from './pages/ProfilePage'
import { transactions as initialTransactions, budgets, reports, walletSummary } from './utils/data'

const pages = {
  //dashboard: 'Dashboard',
  transactions: 'Transaksi',
  //reports: 'Laporan',
  //budget: 'Budget',
  // profile: 'Profil',
  login: 'Login',
  register: 'Register',
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filters, setFilters] = useState({ type: 'all' })
  const [transactions, setTransactions] = useState(initialTransactions)
  const [userProfile, setUserProfile] = useState({
    nama: 'nafhisa naila',
    email: 'Naila@email.com',
    user: 'Nafhsnael',
    dompet: 'Cash',
    profileImage: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80',
  })

  const addTransaction = (newTransaction) => {
    const transaction = {
      id: `t${Date.now()}`,
      ...newTransaction,
    }
    setTransactions((prev) => [transaction, ...prev])
  }

  const pageComponent = useMemo(() => {
    if (!isAuthenticated) {
      return currentPage === 'register' ? (
        <RegisterPage onSwitch={() => setCurrentPage('login')} onAuthenticate={() => setIsAuthenticated(true)} />
      ) : (
        <LoginPage onSwitch={() => setCurrentPage('register')} onAuthenticate={() => setIsAuthenticated(true)} />
      )
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage walletSummary={walletSummary} transactions={transactions.slice(0, 4)} budgets={budgets} />
      case 'transactions':
        return <TransactionsPage transactions={transactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
      case 'reports':
        return <ReportsPage reports={reports} />
      case 'budget':
        return <BudgetPage budgets={budgets} />
      case 'profile':
        return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} />
      default:
        return <DashboardPage walletSummary={walletSummary} transactions={transactions.slice(0, 4)} budgets={budgets} />
    }
  }, [currentPage, isAuthenticated, filters, transactions])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isAuthenticated={isAuthenticated}
          userProfile={userProfile}
        /> */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {isAuthenticated && <TopBar currentPage={pages[currentPage] || 'Dashboard'} />}
          <div className="mt-6">
            {pageComponent}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
