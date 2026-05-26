import { useEffect, useMemo, useState } from 'react'

import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypePage from './pages/UserTypePage'
import InitialBalancePage from './pages/InitialBalancePage'
import LandingPage from './pages/LandingPage'
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

// Import API services
import { transactionAPI, budgetAPI, debtAPI, savingAPI } from './utils/api'

// Import Admin App kamu agar bisa dipanggil
import AdminApp from '../admin/App'


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
  // Jika alamat diawali dengan 'admin', biarkan Router Admin yang menangani
  if (trimmed.startsWith('admin')) return 'admin_route'
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
  const [walletInfo, setWalletInfo] = useState(null)
  const [showInitialBalance, setShowInitialBalance] = useState(false)
  // Jika token tersimpan, jangan tampilkan landing dulu (hindari flash/landing saat auto-login)
  const [showLanding, setShowLanding] = useState(() => {
    try {
      const t = window?.localStorage?.getItem('token')
      return !t
    } catch (e) {
      return true
    }
  })
  const [initialBalance, setInitialBalance] = useState(0)

  const buildWalletSummary = ({ walletInfoOverride = null } = {}) => {
    const current = Number(walletInfoOverride?.balance ?? walletInfo?.balance ?? initialBalance ?? 0)
    return {
      current,
      income: current,
      expense: 0,
    }
  }
  const [filters, setFilters] = useState({ type: 'all' })
  const [selectedUmkmCategory, setSelectedUmkmCategory] = useState('Penjualan')
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])

  const mahasiswaTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.metadata?.is_mahasiswa !== undefined) return t.metadata.is_mahasiswa
      if (t.metadata?.is_masyarakat !== undefined) return !t.metadata.is_masyarakat
      const masyarakatUniqueCategories = ['Penghasilan Kerja', 'Belanja', 'Tagihan', 'Transport']
      return !masyarakatUniqueCategories.includes(t.category) && !t.metadata?.is_umkm && !t.is_umkm
    })
  }, [transactions])

  const masyarakatTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.metadata?.is_masyarakat !== undefined) return t.metadata.is_masyarakat
      if (t.metadata?.is_mahasiswa !== undefined) return !t.metadata.is_mahasiswa
      const mahasiswaUniqueCategories = ['Beasiswa', 'UKT', 'Kos', 'Penghasilan Kerja Paruh Waktu', 'Kebutuhan Kuliah']
      return !mahasiswaUniqueCategories.includes(t.category) && !t.metadata?.is_umkm && !t.is_umkm
    })
  }, [transactions])

  const handleUmkmQuickAction = (businessCategory) => {
    // Quick action di Dashboard -> otomatis pilih kategori bisnis di halaman Transaksi UMKM
    setSelectedUmkmCategory(businessCategory)
    setFilters({ type: businessCategory })
    navigateTo('transactions')
  }

  const [umkmTransactions, setUmkmTransactions] = useState([])
  const [umkmEWalletBalance, setUmkmEWalletBalance] = useState(0)
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
    const handleStorage = (e) => {
      if (!e) return
      if (e.key !== 'token') return

      const nextToken = e.newValue

      setToken(nextToken)
      setIsAuthenticated(Boolean(nextToken))

      if (!nextToken) {
        setShowLanding(true)
        setShowUserType(false)
        setShowInitialBalance(false)
        setUserType(null)
        setWalletInfo(null)

        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/login')
        }
        setCurrentPage('login')
        return
      }

      // Token ada: jangan tampilkan landing (biar auto-auth di effect [token] jalan)
      setShowLanding(false)
      setShowUserType(false)
      setShowInitialBalance(false)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])


  const fetchAllData = async () => {
    try {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      const [transactionsRes, debtsRes, savingsRes, budgetsRes] = await Promise.all([
        transactionAPI.list(),
        debtAPI.list(),
        savingAPI.list(),
        budgetAPI.list(currentMonth)
      ])

      // Normalisasi data dari snake_case (backend) ke camelCase (frontend)
      const normalizedDebts = (debtsRes.data || []).map(d => ({
        ...d,
        creditor: d.creditor_name,
        dueDate: d.due_date,
      }))

      const normalizedSavings = (savingsRes.data || []).map(s => ({
        ...s,
        target: s.target_amount,
        current: s.current_amount,
        deadline: s.target_date,
      }))

      return {
        transactions: transactionsRes.data || [],
        debts: normalizedDebts,
        savings: normalizedSavings,
        budgets: budgetsRes.data || []
      }
    } catch (e) {
      console.error('Error fetching data:', e)
      return { transactions: [], debts: [], savings: [], budgets: [] }
    }
  }

  useEffect(() => {
    if (!token) return

    // Mulai auto-auth dari token: pastikan tidak menampilkan landing
    setShowLanding(false)

    setAuthLoading(true)


    Promise.all([fetchCurrentUser(), fetchWalletInfo(), fetchAllData()])
      .then(([authUser, walletData, allData]) => {
        setUserProfile(prev => ({
          ...prev,
          nama: authUser.name || prev.nama,
          user: authUser.username || prev.user,
          email: authUser.email || prev.email,
          usertype: authUser.user_type || authUser.role || prev.usertype,
          dompet: walletData?.name || (authUser.role === 'admin' ? 'Admin Wallet' : prev.dompet),
        }))
        setWalletInfo(walletData)
        
        if (allData) {
          setTransactions(allData.transactions)
          setUmkmTransactions(allData.transactions.filter(t => t.metadata?.is_umkm || t.is_umkm))
          setDebts(allData.debts)
          setSavings(allData.savings)
          setBudgets(allData.budgets)
        }

        // InitialBalance:
        // - Saat USER BARU REGISTER: harus isi saldo awal.
        // - Saat LOGIN biasa / auto-login: tidak diarahkan ke InitialBalance.
        // Di sini kita biarkan InitialBalance hanya muncul jika usersedang onboarding (showUserType sudah true sebelumnya).
        const walletHasBalance = walletData?.balance && Number(walletData.balance) > 0
        if (showUserType) {
          if (!walletHasBalance) {
            setShowInitialBalance(true)
          }
        }


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
    // JANGAN REDIRECT jika user sedang mengakses halaman admin
    if (window.location.pathname.startsWith('/admin')) return;

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

  const syncBudgetWithTransaction = (transaction) => {
    const amount = Number(transaction.amount) || 0
    setBudgets((prevBudgets) => {
      const existingBudget = prevBudgets.find((b) => b.category === transaction.category)
      if (!existingBudget) {
        // Jangan buat budget baru otomatis berdasarkan transaksi.
        // Budget hanya muncul jika user menambahkannya manual lewat halaman Budget.
        return prevBudgets
      }

      return prevBudgets.map((budget) => {
        if (budget.category !== transaction.category) return budget

        if (transaction.type === 'expense') {
          return {
            ...budget,
            usage: (budget.usage || 0) + amount,
          }
        }

        return {
          ...budget,
          limit: (budget.limit || 0) + amount,
        }
      })
    })
  }

  const addTransaction = async (newTransaction) => {
    // Debug bisa diaktifkan bila perlu
    // console.log('addTransaction', { usertype: userProfile?.usertype, newTransaction })
    const tempId = 't-' + Date.now()
    const isMahasiswa = userProfile?.usertype === 'mahasiswa'
    const isMasyarakat = userProfile?.usertype === 'masyarakat'

    // Optimistic update (biar riwayat langsung terisi seperti UMKM)
    const tempTransaction = {
      id: tempId,
      ...newTransaction,
      // Pastikan type/category/date field yang dipakai UI tetap konsisten
      type: newTransaction.type || (newTransaction.category && ['Penghasilan Kerja', 'Uang Saku', 'Tabungan'].includes(newTransaction.category) ? 'income' : 'expense'),
      metadata: {
        ...newTransaction.metadata,
        is_mahasiswa: isMahasiswa,
        is_masyarakat: isMasyarakat,
      },
      wallet_id: walletInfo?.id || newTransaction.wallet_id,
      // Konsisten dengan TransactionCard
      wallet: walletInfo?.name || newTransaction.wallet || null,
      bank: newTransaction.bank || null,
    }


    setTransactions((prev) => [tempTransaction, ...prev])
    syncBudgetWithTransaction(tempTransaction)

    try {
      const payload = {
        ...newTransaction,
        wallet_id: walletInfo?.id || newTransaction.wallet_id,
        metadata: {
          ...newTransaction.metadata,
          is_mahasiswa: isMahasiswa,
          is_masyarakat: isMasyarakat,
        }
      }

      const res = await transactionAPI.create(payload)
      const transaction = {
        ...res.data,
        metadata: {
          is_mahasiswa: isMahasiswa,
          is_masyarakat: isMasyarakat,
        }
      }

      // Replace temp transaction with real transaction
      // Jangan ubah type secara tidak sengaja agar item tetap masuk ke riwayat sesuai filter.
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id !== tempId) return t
          return {
            ...t,
            ...transaction,
            type: transaction.type || tempTransaction.type,
            metadata: {
              ...(tempTransaction.metadata || {}),
              ...(transaction.metadata || {}),
            },
          }
        })
      )
      syncBudgetWithTransaction(transaction)


      // Update wallet info after transaction
      const walletData = await fetchWalletInfo()
      if (walletData) setWalletInfo(walletData)
    } catch (e) {
      // Rollback optimistic updates
      setTransactions((prev) => prev.filter((t) => t.id !== tempId))
      alert('Gagal menyimpan transaksi ke server: ' + (e.message || 'Error tidak diketahui'))
    }
  }


  const addUmkmTransaction = async (newTransaction) => {
    const tempId = 't-' + Date.now()

    // Pastikan wallet_id tidak kosong agar backend tidak error `The wallet id field is required.`
    // (walletInfo.id hanya ada jika wallet sudah ter-load saat user login)
    const safeWalletId = walletInfo?.id || newTransaction.wallet_id

    const tempTransaction = {
      id: tempId,
      ...newTransaction,
      wallet_id: safeWalletId,
      isUmkm: true,
      businessCategory: newTransaction.businessCategory,
      invoice: 'INV-TEMP' // Temporary invoice placeholder
    }


    // 1. Optimistic Updates - Instantly append to state
    setUmkmTransactions((prev) => [tempTransaction, ...prev])
    setTransactions((prev) => [tempTransaction, ...prev])
    syncBudgetWithTransaction(tempTransaction)

    const amount = Number(newTransaction.amount) || 0
    const isDebtCategory = newTransaction.businessCategory === 'Hutang Supplier' || newTransaction.businessCategory === 'Piutang Pelanggan'

    // Optimistically update wallet info & e-wallet balance
    if (newTransaction.type === 'income') {
      setUmkmEWalletBalance((prev) => prev + amount)
      setWalletInfo((prev) => prev ? { ...prev, balance: Number(prev.balance) + amount } : prev)
    } else {
      setUmkmEWalletBalance((prev) => Math.max(0, prev - amount))
      setWalletInfo((prev) => prev ? { ...prev, balance: Math.max(0, Number(prev.balance) - amount) } : prev)
    }

    // Optimistically update UMKM summary metrics
    setUmkmSummary((prevSummary) => {
      const stockQty = Number(newTransaction.stockQty) || 1
      const selectedStockId = newTransaction.stockItemId
      const estimatedHpp = Math.round(amount * 0.42)

      const updateInventory = (change, itemToAddIfMissing = null) => {
        const inventory = Array.isArray(prevSummary.inventory) ? prevSummary.inventory : []
        const found = inventory.some((item) => String(item.id) === String(selectedStockId))
        if (!found && itemToAddIfMissing) {
          return [
            ...inventory,
            {
              id: selectedStockId,
              name: itemToAddIfMissing.name,
              stock: Math.max(0, Number(itemToAddIfMissing.stock ?? stockQty) + (change ?? 0)),
              reorderLevel: Number(itemToAddIfMissing.reorderLevel ?? 10),
            },
          ]
        }
        return inventory.map((item) =>
          String(item.id) === String(selectedStockId)
            ? { ...item, stock: Math.max(0, Number(item.stock ?? 0) + (change ?? 0)) }
            : item
        )
      }

      let nextSummary = { ...prevSummary }

      switch (newTransaction.businessCategory) {
        case 'Penjualan':
          nextSummary.income += amount
          nextSummary.estimatedHpp += estimatedHpp
          if (newTransaction.linkedStock) nextSummary.inventory = updateInventory(-stockQty)
          break
        case 'Pemasukan':
          nextSummary.income += amount
          break
        case 'Pengeluaran Operasional':
          nextSummary.operationalExpense += amount
          break
        case 'Beli Bahan Baku / Stok':
          if (selectedStockId) {
            nextSummary.inventory = updateInventory(stockQty, {
              name: newTransaction.stockItemName || selectedStockId,
              stock: stockQty,
              reorderLevel: 10,
            })
          }
          nextSummary.estimatedHpp += amount
          break
        case 'Piutang Pelanggan':
          if (newTransaction.isSettled) nextSummary.income += amount
          else nextSummary.receivables += amount
          if (newTransaction.linkedStock) {
            nextSummary.inventory = updateInventory(-stockQty)
            nextSummary.estimatedHpp += estimatedHpp
          }
          break
        case 'Hutang Supplier':
          nextSummary.payables += amount
          nextSummary.inventory = updateInventory(stockQty, {
            name: newTransaction.stockItemName || selectedStockId,
            stock: stockQty,
            reorderLevel: 10,
          })
          nextSummary.estimatedHpp += amount
          if (newTransaction.isSettled) {
            nextSummary.payables = Math.max(0, nextSummary.payables - amount)
            nextSummary.operationalExpense += amount
          }
          break
      }
      return nextSummary
    })

    // 2. Perform API call in background/asynchronously to persist to DB
    try {
      const payload = {
        ...newTransaction,
        metadata: {
          ...newTransaction.metadata,
          is_umkm: true,
          businessCategory: newTransaction.businessCategory,
          stockItemId: newTransaction.stockItemId,
          stockQty: newTransaction.stockQty,
          linkedStock: newTransaction.linkedStock
        }
      }
      
      const res = await transactionAPI.create(payload)
      const transaction = {
        ...res.data,
        isUmkm: true,
        businessCategory: newTransaction.businessCategory
      }

      // Replace the optimistic temp transaction with the real transaction from backend
      setUmkmTransactions((prev) => prev.map((t) => t.id === tempId ? transaction : t))
      setTransactions((prev) => prev.map((t) => t.id === tempId ? transaction : t))

      // Persist debt category in DB if applicable
      if (isDebtCategory) {
        try {
          await debtAPI.create({
            wallet_id: walletInfo?.id,
            creditor_name: newTransaction.businessCategory,
            amount: amount,
            due_date: newTransaction.date || new Date().toISOString(),
            note: newTransaction.note || '',
            status: newTransaction.isSettled ? 'paid' : 'active'
          })
          
          const debtsRes = await debtAPI.list()
          setDebts(debtsRes.data)
        } catch (e) {
          console.error('Error creating debt:', e)
        }
      }

      // Sync wallet balance to ensure it is exact with server
      const walletData = await fetchWalletInfo()
      if (walletData) {
        setWalletInfo(walletData)
        setUmkmEWalletBalance(Number(walletData.balance))
      }
    } catch (e) {
      // Rollback optimistic updates if backend fails
      setUmkmTransactions((prev) => prev.filter((t) => t.id !== tempId))
      setTransactions((prev) => prev.filter((t) => t.id !== tempId))

      if (newTransaction.type === 'income') {
        setUmkmEWalletBalance((prev) => Math.max(0, prev - amount))
        setWalletInfo((prev) => prev ? { ...prev, balance: Math.max(0, Number(prev.balance) - amount) } : prev)
      } else {
        setUmkmEWalletBalance((prev) => prev + amount)
        setWalletInfo((prev) => prev ? { ...prev, balance: Number(prev.balance) + amount } : prev)
      }

      alert('Gagal menyimpan transaksi UMKM ke server: ' + (e.message || 'Error tidak diketahui'))
    }
  }

  const addDebt = async (newDebt) => {
    try {
      const payload = {
        wallet_id: walletInfo?.id,
        creditor_name: newDebt.creditor,
        amount: newDebt.amount,
        due_date: newDebt.dueDate,
        note: newDebt.note,
        status: 'active'
      }
      const res = await debtAPI.create(payload)
      const normalized = {
        ...res.data,
        creditor: res.data.creditor_name,
        dueDate: res.data.due_date
      }
      setDebts((prev) => [...prev, normalized])
    } catch (e) {
      alert('Gagal menyimpan hutang: ' + (e.message || 'Error tidak diketahui'))
    }
  }

  const addSavings = async (newSavings) => {
    try {
      const payload = {
        wallet_id: walletInfo?.id,
        name: newSavings.name,
        target_amount: newSavings.target,
        current_amount: newSavings.current || 0,
        target_date: newSavings.deadline,
        category: newSavings.category || 'Tabungan',
        note: newSavings.note || ''
      }
      const res = await savingAPI.create(payload)
      const normalized = {
        ...res.data,
        target: res.data.target_amount,
        current: res.data.current_amount,
        deadline: res.data.target_date
      }
      setSavings((prev) => [...prev, normalized])
    } catch (e) {
      alert('Gagal menyimpan tabungan: ' + (e.message || 'Error tidak diketahui'))
    }
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
    try {
      const res = await authFetch('/api/wallet/me', { method: 'GET' })
      if (!res.ok) {
        // Wallet belum ada/belum dibuat - return null
        return null
      }

      const json = await res.json()
      return json.data?.wallet || json.data
    } catch (e) {
      // Jika error, return null agar InitialBalance bisa di-tampilkan
      return null
    }
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
      }))
    }

    setIsAuthenticated(true)

    // Alur:
    // - LOGIN: jangan pakai pilih user type & jangan minta saldo awal, langsung dashboard (atau InitialBalance kalau memang belum ada wallet balance via useEffect token)
    // - REGISTER BARU: pakai flow pilih user type -> initial balance -> dashboard
    if (isRegister) {
      setShowUserType(true)
      setShowInitialBalance(false)
    } else {
      setShowUserType(false)
      setShowInitialBalance(false)
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
    setShowInitialBalance(true)
  }

  const handleSaveInitialBalance = async (data) => {
    const balance = data.balance
    setInitialBalance(balance)

    // UMKM: saldo awal harus masuk ke e-wallet UMKM + ringkasan pemasukan (agar Dompet Usaha ikut terisi)
    if (userProfile?.usertype === 'umkm') {
      setUmkmEWalletBalance(balance)

      setUmkmSummary((prevSummary) => {
        // Di dashboard UMKM, 'Saldo Pemasukan' memakai umkmSummary.income.
        // Jadi saat saldo awal dimasukkan, income harus ikut terisi.
        return {
          ...prevSummary,
          income: balance,
        }
      })
    }

    setShowInitialBalance(false)
    
    // Re-fetch wallet info agar updated
    try {
      const walletData = await fetchWalletInfo()
      if (walletData) {
        setWalletInfo(walletData)
      }
    } catch (e) {
      console.error('Error fetching wallet after initial balance save:', e)
    }
    
    navigateTo('dashboard')
  }

  const handleLogout = async () => {
    if (token) {
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    }

    setToken(null)
    setIsAuthenticated(false)
    navigateTo('login')
    setShowLanding(true)
    setUserType(null)
    setWalletInfo(null)
    setShowUserType(false)
    setShowInitialBalance(false)

    try {
      window.localStorage.removeItem('token')
    } catch (e) {
      // ignore
    }
  }

  const handleLandingLogin = () => {
    setShowLanding(false)
    navigateTo('login')
  }

  const handleLandingRegister = () => {
    setShowLanding(false)
    navigateTo('register')
  }

  const pageComponent = useMemo(() => {
    const isAdminPath = window.location.pathname.startsWith('/admin')

    // JIKA AKSES ADMIN: Serahkan sepenuhnya ke AdminApp (Router Admin)
    if (isAdminPath) {
      return <AdminApp />
    }

    if (isAuthenticated && showUserType) {
      return <UserTypePage onNext={handleUserTypeNext} />
    }

    if (showInitialBalance) {
      return <InitialBalancePage onSave={handleSaveInitialBalance} initialBalance={initialBalance} />
    }

    if (!isAuthenticated && showLanding) {
      return <LandingPage onLoginClick={handleLandingLogin} onRegisterClick={handleLandingRegister} />
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
              defaultCategory={selectedUmkmCategory}
            />
          )
        }
        if (userProfile?.usertype === 'mahasiswa') {
          return <TransactionsMahasiswaPage transactions={mahasiswaTransactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
        }
        return <TransactionsMasyarakatPage transactions={masyarakatTransactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
      case 'analysis':
        return <AnalysisPage transactions={userProfile?.usertype === 'mahasiswa' ? mahasiswaTransactions : userProfile?.usertype === 'umkm' ? umkmTransactions : masyarakatTransactions} />
      case 'reports':
        return <ReportsPage transactions={userProfile?.usertype === 'mahasiswa' ? mahasiswaTransactions : userProfile?.usertype === 'umkm' ? umkmTransactions : masyarakatTransactions} debts={debts} savings={savings} onNavigate={setCurrentPage} />
      case 'budget':
        return <BudgetPage transactions={userProfile?.usertype === 'mahasiswa' ? mahasiswaTransactions : userProfile?.usertype === 'umkm' ? umkmTransactions : masyarakatTransactions} budgets={budgets} setBudgets={setBudgets} userType={userProfile?.usertype || userType} />
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
              walletSummary={{
                current: initialBalance,
                income: initialBalance,
                expense: 0,
                smartCashPerDay: initialBalance,
                smartReductionPerDay: 0,
              }}
              transactions={mahasiswaTransactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              onQuickAction={(category) => {
                setFilters({ type: category })
                navigateTo('transactions')
              }}
            />
          ) : userProfile?.usertype === 'masyarakat' ? (
            <DashboardMasyarakatPage
              walletSummary={{
                current: initialBalance,
                income: initialBalance,
                expense: 0,
                smartCashPerDay: initialBalance,
                smartReductionPerDay: 0,
              }}
              transactions={masyarakatTransactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              onQuickAction={(category) => {
                setFilters({ type: 'expense' })
                // Navigasi ke Transactions Masyarakat, lalu preset kategori melalui search agar sesuai label quick action.
                navigateTo('transactions')
                setTimeout(() => {
                  try {
                    window.dispatchEvent(new CustomEvent('quickActionCategory', { detail: category }))
                  } catch (e) {}
                }, 0)
              }}
            />
          ) : userProfile?.usertype === 'umkm' ? (
            <DashboardUMKMPage
              walletSummary={{
                // Untuk UMKM: dompet usaha (e-wallet) di dashboard memakai umkmEWalletBalance
                current: umkmEWalletBalance || initialBalance || Number(walletInfo?.balance ?? 0),
                // income/expense pada e-wallet dashboard UMKM tidak dipakai, jadi set 0 agar tidak dobel
                income: 0,
                expense: 0,
                smartCashPerDay: 0,
                smartReductionPerDay: 0,
              }}
              transactions={umkmTransactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              umkmSummary={umkmSummary}
              eWalletBalance={umkmEWalletBalance || initialBalance}
              onQuickAction={handleUmkmQuickAction}
            />
          ) : (
            <DashboardPage
              walletSummary={{
                current: initialBalance || Number(walletInfo?.balance ?? 0),
                income: initialBalance,
                expense: 0,
                smartCashPerDay: initialBalance,
                smartReductionPerDay: 0,
              }}
              transactions={transactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              umkmSummary={umkmSummary}
              onQuickAction={handleUmkmQuickAction}
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
  }, [currentPage, isAuthenticated, showUserType, showLanding, showInitialBalance, initialBalance, filters, selectedUmkmCategory, transactions, debts, savings, userProfile, walletInfo])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isAuthenticated && !showUserType && !showInitialBalance && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => navigateTo(page)}
          userProfile={userProfile}
          onLogout={handleLogout}
        />
      )}
      <div className={`flex-1 flex flex-col ${isAuthenticated && !showUserType && !showInitialBalance ? 'ml-64' : ''}`}>
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
