import { useEffect, useMemo, useState } from 'react'

import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserTypePage from './pages/UserTypePage'
import InitialBalancePage from './pages/InitialBalancePage'
import LandingPage from './pages/LandingPage'
import AnalysisPage from './pages/AnalysisPage'
import AnalysisMasyarakatPage from './pages/AnalysisMasyarakatPage'
import AnalysisMahasiswaPage from './pages/AnalysisMahasiswaPage'
import AnalysisUMKMPage from './pages/AnalysisUMKMPage'


import TransactionsUMKMPage from './pages/TransactionsUMKMPage'
import TransactionsMahasiswaPage from './pages/TransactionsMahasiswaPage'
import TransactionsMasyarakatPage from './pages/TransactionsMasyarakatPage'
import ReportsPage from './pages/ReportsPage'
import ReportsUMKMPage from './pages/ReportsUMKMPage'
import ReportsMahasiswaPage from './pages/ReportsMahasiswaPage'
import ReportsMasyarakatPage from './pages/ReportsMasyarakatPage'
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

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const readInitialToken = () => {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const isGoogleCallback = window.location.pathname === '/auth/google/callback'
  const googleToken = isGoogleCallback ? params.get('token') : null

  if (googleToken) {
    window.localStorage.setItem('token', googleToken)
    window.history.replaceState(null, '', '/')
    return googleToken
  }

  return window.localStorage.getItem('token')
}

const buildApiUrl = (url) => {
  if (/^https?:\/\//i.test(url)) return url

  if (url.startsWith('/api')) {
    return `${backendUrl}${url}`
  }

  return `${backendUrl}/api${url.startsWith('/') ? url : `/${url}`}`
}

const formatDateToYMD = (value) => {
  const date = value instanceof Date
    ? value
    : typeof value === 'string' && value.trim()
      ? new Date(value)
      : null

  if (!date || Number.isNaN(date.getTime())) {
    const fallback = new Date()
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

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
  const [reportsDefaultTab, setReportsDefaultTab] = useState('daily')
  const [token, setToken] = useState(readInitialToken)
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
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const t = window?.localStorage?.getItem('token')
      return !t
    } catch (e) {
      return true
    }
  })
  const [isSplashLeaving, setIsSplashLeaving] = useState(false)
  const [pageVisible, setPageVisible] = useState(!showSplash)
  const [initialBalance, setInitialBalance] = useState(0)

  useEffect(() => {
    if (!showSplash) {
      setPageVisible(true)
      return
    }

    const leaveTimer = window.setTimeout(() => {
      setIsSplashLeaving(true)
      setPageVisible(true)
    }, 1200)

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false)
      setIsSplashLeaving(false)
    }, 1700)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
    }
  }, [showSplash])

  const SplashScreen = ({ leaving }) => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-teal-600 via-[#38ADA9] to-teal-400 text-white transition-opacity duration-700 ${leaving ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`mx-auto text-center transition-transform duration-700 ${leaving ? 'scale-75 -translate-y-12' : 'scale-100 translate-y-0'}`}>
        <div className={`mx-auto h-36 w-36 overflow-hidden rounded-full border-2 border-white/30 bg-white/30 p-4 flex items-center justify-center ${leaving ? 'logo-fly' : ''}`}>
          <img
            src="/logo.png"
            alt="KasCerdas"
            className={`h-full w-full object-contain transition-all duration-700 ${leaving ? 'opacity-0 -translate-y-4 scale-75' : 'opacity-100 translate-y-0 scale-100'} animate-bounce`}
          />
        </div>
        <p className="mt-6 text-3xl font-semibold text-white">KasCerdas</p>
        <p className="mt-2 text-base text-white/80">Sedang membuka landing page...</p>
      </div>
    </div>
  );

  const buildWalletSummary = ({ walletInfoOverride = null } = {}) => {
    const current = Number(walletInfoOverride?.balance ?? walletInfo?.balance ?? initialBalance ?? 0)
    return {
      current,
      income: current,
      expense: 0,
    }
  }
  const [filters, setFilters] = useState({ type: 'all' })
  const [selectedUmkmCategory, setSelectedUmkmCategory] = useState('all')
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [defaultReportTab, setDefaultReportTab] = useState('daily')

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    if (typeof metadata === 'string') {
      try {
        const parsed = JSON.parse(metadata)
        return parsed && typeof parsed === 'object' ? parsed : {}
      } catch (e) {
        return {}
      }
    }
    return typeof metadata === 'object' ? metadata : {}
  }

  const hasMetaValue = (value) => value !== undefined && value !== null

  const metaToBool = (value) => {
    return value === true || value === 1 || value === '1' || value === 'true'
  }

  const mahasiswaTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const metadata = parseMetadata(t.metadata)

      if (hasMetaValue(metadata.is_mahasiswa)) return metaToBool(metadata.is_mahasiswa)
      if (hasMetaValue(metadata.is_masyarakat)) return !metaToBool(metadata.is_masyarakat)

      const masyarakatUniqueCategories = ['Penghasilan Kerja', 'Belanja', 'Tagihan', 'Transport']
      return !masyarakatUniqueCategories.includes(t.category) && !metadata.is_umkm && !t.is_umkm
    })
  }, [transactions])

  const masyarakatTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const metadata = parseMetadata(t.metadata)

      if (hasMetaValue(metadata.is_masyarakat)) return metaToBool(metadata.is_masyarakat)
      if (hasMetaValue(metadata.is_mahasiswa)) return !metaToBool(metadata.is_mahasiswa)

      const mahasiswaUniqueCategories = ['Beasiswa', 'UKT', 'Kos', 'Penghasilan Kerja Paruh Waktu', 'Kebutuhan Kuliah']
      return !mahasiswaUniqueCategories.includes(t.category) && !metadata.is_umkm && !t.is_umkm
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

  const buildStorageUrl = (path) => {
    if (!path) return null

    const value = String(path).trim()
    if (!value) return null
    if (/^(https?:|blob:|data:)/i.test(value)) return value

    const cleanPath = value.replace(/^\/+/, '')
    const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`

    const envBackendUrl = import.meta.env?.VITE_BACKEND_URL || ''
    const envApiUrl = import.meta.env?.VITE_API_URL || ''
    const apiOrigin = envApiUrl ? envApiUrl.replace(/\/api\/?$/, '') : ''
    const isViteLocal = typeof window !== 'undefined' && /^517\d$/.test(window.location.port)
    const backendOrigin = envBackendUrl || apiOrigin || (isViteLocal ? 'http://localhost:8000' : '')

    return backendOrigin ? `${backendOrigin}/${storagePath}` : `/${storagePath}`
  }

  const receiptToPreview = (receipt) => {
    if (!receipt) return null

    if (typeof File !== 'undefined' && receipt instanceof File) {
      return {
        name: receipt.name,
        type: receipt.type,
        url: URL.createObjectURL(receipt),
      }
    }

    if (typeof receipt === 'object') {
      return {
        ...receipt,
        url: buildStorageUrl(receipt.url || receipt.preview || receipt.path || receipt.receipt_url),
      }
    }

    return receipt
  }

  const normalizeTransaction = (transaction) => {
    if (!transaction) return transaction

    const receiptPath = transaction.receipt_url || transaction.receiptUrl
    const fileName = receiptPath ? String(receiptPath).split('/').pop() : ''
    const lowerName = fileName.toLowerCase()
    const metadata = parseMetadata(transaction.metadata)

    const businessCategory = transaction.businessCategory || metadata.businessCategory || metadata.business_category || transaction.category
    const stockItemName = transaction.stockItemName || metadata.stockItemName || metadata.stock_item_name || ''
    const stockItemId = transaction.stockItemId || metadata.stockItemId || metadata.stock_item_id || ''
    const stockQty = transaction.stockQty ?? metadata.stockQty ?? metadata.stock_qty ?? ''

    return {
      ...transaction,
      metadata,
      businessCategory,
      isUmkm: transaction.isUmkm || metaToBool(metadata.is_umkm),
      stockItemId,
      stockItemName,
      stockQty,
      linkedStock: transaction.linkedStock ?? metaToBool(metadata.linkedStock ?? metadata.linked_stock),
      isSettled: transaction.isSettled ?? metaToBool(metadata.isSettled ?? metadata.is_settled),
      date: typeof transaction.date === 'string' && transaction.date.includes('T')
        ? transaction.date.slice(0, 10)
        : transaction.date,
      receipt: transaction.receipt || (receiptPath ? {
        name: fileName || 'Bukti Nota',
        type: lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        url: buildStorageUrl(receiptPath),
      } : null),
    }
  }

  const getUmkmCategory = (transaction) => {
    const metadata = parseMetadata(transaction?.metadata)
    return transaction?.businessCategory || metadata.businessCategory || metadata.business_category || transaction?.category || ''
  }

  const getStockItemName = (transaction) => {
    const metadata = parseMetadata(transaction?.metadata)
    return (
      transaction?.stockItemName ||
      metadata.stockItemName ||
      metadata.stock_item_name ||
      transaction?.stockItemId ||
      metadata.stockItemId ||
      metadata.stock_item_id ||
      ''
    )
  }

  const getStockQty = (transaction) => {
    const metadata = parseMetadata(transaction?.metadata)
    return Number(transaction?.stockQty ?? metadata.stockQty ?? metadata.stock_qty ?? 0) || 0
  }

  const buildUmkmSummaryFromTransactions = (items = []) => {
    const nextSummary = {
      income: 0,
      operationalExpense: 0,
      estimatedHpp: 0,
      payables: 0,
      receivables: 0,
      inventory: [],
    }

    const addInventoryEntry = (transaction, quantityFallback = 1) => {
      const cleanName = String(getStockItemName(transaction) || transaction?.title || '').trim()
      const quantity = Number(getStockQty(transaction) || quantityFallback) || 0
      if (!cleanName || quantity <= 0) return

      nextSummary.inventory.push({
        id: `stok-${transaction?.id || nextSummary.inventory.length}-${nextSummary.inventory.length}`,
        transactionId: transaction?.id,
        invoice: transaction?.invoice,
        date: transaction?.date,
        name: cleanName,
        stock: quantity,
        reorderLevel: 10,
      })
    }

    items.forEach((transaction) => {
      const category = getUmkmCategory(transaction)
      const amount = Number(transaction?.amount) || 0
      const metadata = parseMetadata(transaction?.metadata)
      const linkedStock = transaction?.linkedStock ?? metaToBool(metadata.linkedStock ?? metadata.linked_stock)
      const isSettled = transaction?.isSettled ?? metaToBool(metadata.isSettled ?? metadata.is_settled)
      const estimatedHpp = Math.round(amount * 0.42)

      switch (category) {
        case 'Penjualan':
          nextSummary.income += amount
          nextSummary.estimatedHpp += estimatedHpp
          break
        case 'Pemasukan':
          nextSummary.income += amount
          break
        case 'Pengeluaran Operasional':
          nextSummary.operationalExpense += amount
          break
        case 'Beli Bahan Baku / Stok':
          // Setiap transaksi stok ditampilkan sebagai baris sendiri.
          // Jadi walaupun nama produknya sama, kuantitasnya tidak digabung.
          addInventoryEntry(transaction)
          nextSummary.estimatedHpp += amount
          break
        case 'Piutang Pelanggan':
          if (isSettled) nextSummary.income += amount
          else nextSummary.receivables += amount
          if (linkedStock) nextSummary.estimatedHpp += estimatedHpp
          break
        case 'Hutang Supplier':
          nextSummary.payables += amount
          addInventoryEntry(transaction)
          nextSummary.estimatedHpp += amount
          if (isSettled) {
            nextSummary.payables = Math.max(0, nextSummary.payables - amount)
            nextSummary.operationalExpense += amount
          }
          break
        default:
          break
      }
    })

    return nextSummary
  }


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
        transactionAPI.listAll(),
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
        transactions: (transactionsRes.data || []).map(normalizeTransaction),
        debts: normalizedDebts,
        savings: normalizedSavings,
        budgets: budgetsRes.data || []
      }
    } catch (e) {
      console.error('Error fetching data:', e)
      // Jika sedang dalam mode pengembangan lokal (token dev), sediakan data demo
      try {
        const localToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null
        if (localToken && String(localToken).startsWith('dev-token')) {
          const now = new Date()
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
          const sampleTransactions = [
            { id: 't-dev-1', title: 'Makan Siang', amount: 25000, type: 'expense', category: 'Makan', date: today, metadata: {} },
            { id: 't-dev-2', title: 'Ojek', amount: 15000, type: 'expense', category: 'Transportasi', date: today, metadata: {} },
            { id: 't-dev-3', title: 'Gaji Sampingan', amount: 500000, type: 'income', category: 'Pemasukan', date: today, metadata: {} },
            { id: 't-dev-4', title: 'Beli Buku', amount: 80000, type: 'expense', category: 'Kebutuhan Kuliah', date: today, metadata: {} },
          ]

          const sampleDebts = [
            { id: 'd-dev-1', creditor: 'Toko Kelontong', amount: 100000, dueDate: today, note: 'Hutang dagang', status: 'active' }
          ]

          const sampleSavings = [
            { id: 's-dev-1', name: 'Tabungan Liburan', target: 2000000, current: 150000, deadline: today }
          ]

          return { transactions: sampleTransactions, debts: sampleDebts, savings: sampleSavings, budgets: [] }
        }
      } catch (err) {
        console.error('Error preparing demo data:', err)
      }

      return { transactions: [], debts: [], savings: [], budgets: [] }
    }
  }

  useEffect(() => {
    if (!token) return

    setShowLanding(false)
    setAuthLoading(true)

    Promise.all([fetchCurrentUser(), fetchWalletInfo(), fetchAllData()])
      .then(([authUser, walletData, allData]) => {
        const isAdmin = authUser.role === 'admin'

        // Kalau user login Google baru, biasanya user_type masih null.
        // Jadi jangan pakai role "user" sebagai usertype.
        const resolvedUserType = authUser.user_type || (isAdmin ? 'admin' : null)

        setUserProfile((prev) => ({
          ...prev,
          nama: authUser.name || prev.nama,
          user: authUser.username || prev.user,
          email: authUser.email || prev.email,
          usertype: resolvedUserType,
          dompet: walletData?.name || (isAdmin ? 'Admin Wallet' : prev.dompet),
          profileImage: authUser.avatar || prev.profileImage,
        }))

        setWalletInfo(walletData)

        if (walletData?.balance !== undefined && walletData?.balance !== null) {
          const balance = Number(walletData.balance) || 0
          setInitialBalance(balance)

          if (resolvedUserType === 'umkm') {
            setUmkmEWalletBalance(balance)
          }
        }

        if (allData) {
          const allTransactions = allData.transactions || []
          const userTypeLower = String(resolvedUserType || '').toLowerCase()

          const umkmItems = userTypeLower === 'umkm'
            ? allTransactions
            : allTransactions.filter((t) => {
              const metadata = parseMetadata(t.metadata)
              return metaToBool(metadata.is_umkm) || t.isUmkm || t.is_umkm
            })

          setTransactions(allTransactions)
          setUmkmTransactions(umkmItems)
          setUmkmSummary(buildUmkmSummaryFromTransactions(umkmItems))
          setDebts(allData.debts || [])
          setSavings(allData.savings || [])
          setBudgets(allData.budgets || [])
        }

        setIsAuthenticated(true)

        // INI BAGIAN PALING PENTING:
        // Kalau user belum punya user_type, tampilkan halaman pilih tipe pengguna.
        // Ini cocok untuk Register Google / Login Google akun baru.
        if (!authUser.user_type && !isAdmin) {
          setShowUserType(true)
          setShowInitialBalance(false)
          setShowLanding(false)
          return
        }

        // Kalau user sudah punya user_type, langsung dashboard.
        setShowUserType(false)
        setShowInitialBalance(false)
        setShowLanding(false)
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
    const profileType = String(userProfile?.usertype || userType || '').toLowerCase()
    const incomingMetadata = parseMetadata(newTransaction.metadata)

    const categoryLabel = String(newTransaction?.category || '').trim()
    const isDebtCategory = categoryLabel.toLowerCase().includes('hutang')
    const isSavingsCategory = categoryLabel.toLowerCase() === 'tabungan'

    // Sinkronisasi transaksi kategori mahasiswa ke rekap: Debt / Saving
    // (default mapping)
    const debtTitle = String(newTransaction?.title || newTransaction?.note || categoryLabel || 'Hutang').trim()
    const debtAmount = Number(newTransaction?.amount) || 0



    const isMahasiswa = hasMetaValue(incomingMetadata.is_mahasiswa)
      ? metaToBool(incomingMetadata.is_mahasiswa)
      : profileType === 'mahasiswa'

    // Kalau userType belum tersimpan/masih null, halaman transaksi default-nya adalah Masyarakat.
    // Jadi transaksi baru harus tetap diberi tanda is_masyarakat: true agar langsung muncul di riwayat.
    const isMasyarakat = hasMetaValue(incomingMetadata.is_masyarakat)
      ? metaToBool(incomingMetadata.is_masyarakat)
      : (!isMahasiswa && profileType !== 'umkm')

    const transactionMetadata = {
      ...incomingMetadata,
      is_mahasiswa: isMahasiswa,
      is_masyarakat: isMasyarakat,
    }

    const walletId = walletInfo?.id || newTransaction?.wallet_id
    if (!walletId) {
      alert('Dompet belum tersedia. Silakan muat ulang aplikasi atau masuk ulang terlebih dahulu.')
      return
    }

    // Optimistic update (biar riwayat langsung terisi seperti UMKM)
    const tempTransaction = {
      id: tempId,
      ...newTransaction,
      receipt: receiptToPreview(newTransaction.receipt),
      // Pastikan type/category/date field yang dipakai UI tetap konsisten
      type: newTransaction.type || (newTransaction.category && ['Penghasilan Kerja', 'Uang Saku', 'Tabungan'].includes(newTransaction.category) ? 'income' : 'expense'),
      metadata: transactionMetadata,
      wallet_id: walletId,
      // Konsisten dengan TransactionCard
      wallet: walletInfo?.name || newTransaction.wallet || null,
      bank: newTransaction.bank || null,
    }


    setTransactions((prev) => [tempTransaction, ...prev])
    syncBudgetWithTransaction(tempTransaction)

    try {
      const payload = {
        ...newTransaction,
        wallet_id: walletId,
        metadata: transactionMetadata
      }

      const res = await transactionAPI.create(payload)
      const savedTransaction = normalizeTransaction(res.data)

      // Sinkronisasi transaksi mahasiswa ke Debt/Saving (berdasarkan kategori)
      // dilakukan setelah transaksi berhasil dibuat.
      if (isDebtCategory) {
        await mergeOrCreateDebt({
          wallet_id: walletInfo?.id || newTransaction?.wallet_id,
          creditor_name: debtTitle,
          amount: debtAmount,
          due_date: formatDateToYMD(newTransaction?.date),
          note: String(newTransaction?.note || ''),
          status: newTransaction?.isSettled ? 'paid' : 'active'
        })
      }

      if (isSavingsCategory) {
        const name2 = String(newTransaction?.title || 'Tabungan').trim()
        const existingSaving = savings.find((s) => String(s.name || '').trim().toLowerCase() === name2.toLowerCase())

        if (existingSaving) {
          const updatedCurrent = (Number(existingSaving.current_amount || existingSaving.current || 0) + Number(newTransaction?.amount) || 0)
          await savingAPI.update(existingSaving.id, {
            wallet_id: walletInfo?.id || newTransaction?.wallet_id,
            name: existingSaving.name,
            target_amount: Number(existingSaving.target_amount || existingSaving.target || 0),
            current_amount: updatedCurrent,
            target_date: formatDateToYMD(existingSaving.target_date || existingSaving.deadline),
            category: existingSaving.category || 'Tabungan',
            note: existingSaving.note || String(newTransaction?.note || ''),
          })
        } else {
          await savingAPI.create({
            wallet_id: walletInfo?.id || newTransaction?.wallet_id,
            name: name2,
            target_amount: Number(newTransaction?.amount) || 0,
            current_amount: Number(newTransaction?.amount) || 0,
            target_date: formatDateToYMD(newTransaction?.date),
            category: 'Tabungan',
            note: String(newTransaction?.note || ''),
          })
        }

        const savingsRes2 = await savingAPI.list()
        setSavings(savingsRes2.data)
      }

      // (lanjutkan flow replace temp transaction)

      const transaction = {
        ...savedTransaction,
        type: savedTransaction.type || tempTransaction.type,
        metadata: {
          ...transactionMetadata,
          ...parseMetadata(savedTransaction.metadata),
          is_mahasiswa: isMahasiswa,
          is_masyarakat: isMasyarakat,
        },
      }

      // Replace temp transaction with real transaction
      // Jangan ubah type secara tidak sengaja agar item tetap masuk ke riwayat sesuai filter.
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id !== tempId) return t
          return {
            ...t,
            ...transaction,
            receipt: transaction.receipt
              ? {
                ...transaction.receipt,
                fallbackUrl: tempTransaction.receipt?.url || tempTransaction.receipt?.preview || tempTransaction.receipt?.fallbackUrl,
                localUrl: tempTransaction.receipt?.url || tempTransaction.receipt?.preview || tempTransaction.receipt?.localUrl,
              }
              : tempTransaction.receipt,
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

      if (isDebtCategory) {
        setReportsDefaultTab('debt')
      }
    } catch (e) {
      // Rollback optimistic updates
      setTransactions((prev) => prev.filter((t) => t.id !== tempId))
      console.error('Failed to save transaction', {
        payload: {
          ...newTransaction,
          wallet_id: walletId,
          metadata: transactionMetadata,
        },
        error: e,
      })
      if (isDebtCategory) {
        setReportsDefaultTab('debt')
      }
      throw e
    }
  }


  const addUmkmTransaction = async (newTransaction) => {
    const tempId = 't-' + Date.now()

    // Pastikan wallet_id tidak kosong agar backend tidak error `The wallet id field is required.`
    // (walletInfo.id hanya ada jika wallet sudah ter-load saat user login)
    const safeWalletId = walletInfo?.id || newTransaction.wallet_id
    const transactionMetadata = {
      ...parseMetadata(newTransaction.metadata),
      is_umkm: true,
      businessCategory: newTransaction.businessCategory,
      stockItemId: newTransaction.stockItemId || '',
      stockItemName: newTransaction.stockItemName || '',
      stockQty: newTransaction.stockQty || '',
      linkedStock: newTransaction.linkedStock,
      isCredit: newTransaction.isCredit,
      isSettled: newTransaction.isSettled,
    }

    const tempTransaction = {
      id: tempId,
      ...newTransaction,
      metadata: transactionMetadata,
      receipt: receiptToPreview(newTransaction.receipt),
      wallet_id: safeWalletId,
      isUmkm: true,
      businessCategory: newTransaction.businessCategory,
      stockItemId: newTransaction.stockItemId || transactionMetadata.stockItemId,
      stockItemName: newTransaction.stockItemName || transactionMetadata.stockItemName,
      stockQty: newTransaction.stockQty || transactionMetadata.stockQty,
      invoice: 'INV-TEMP' // Temporary invoice placeholder
    }


    // 1. Optimistic Updates - Instantly append to state
    setUmkmTransactions((prev) => [tempTransaction, ...prev])
    setTransactions((prev) => [tempTransaction, ...prev])
    syncBudgetWithTransaction(tempTransaction)

    const amount = Number(newTransaction.amount) || 0
    const businessCategoryLabel = String(newTransaction.businessCategory || '').trim()
    const isDebtCategory = businessCategoryLabel.toLowerCase().includes('hutang') || businessCategoryLabel.toLowerCase().includes('piutang')
    const isSavingsCategory = businessCategoryLabel.toLowerCase() === 'tabungan'
    const debtTitle = String(newTransaction.title || newTransaction.note || businessCategoryLabel || 'Hutang').trim()
    const savingsName = String(newTransaction.title || 'Tabungan').trim()

    // Optimistically update wallet info & e-wallet balance
    if (newTransaction.type === 'income') {
      setUmkmEWalletBalance((prev) => prev + amount)
      setWalletInfo((prev) => prev ? { ...prev, balance: Number(prev.balance) + amount } : prev)
    } else {
      setUmkmEWalletBalance((prev) => Math.max(0, prev - amount))
      setWalletInfo((prev) => prev ? { ...prev, balance: Math.max(0, Number(prev.balance) - amount) } : prev)
    }

    // Optimistically update UMKM summary metrics.
    // Khusus stok: setiap pembelian disimpan sebagai baris sendiri, bukan digabung berdasarkan nama produk.
    setUmkmSummary((prevSummary) => {
      const stockQty = Number(newTransaction.stockQty) || 1
      const selectedStockName = String(newTransaction.stockItemName || newTransaction.stockItemId || '').trim()
      const estimatedHpp = Math.round(amount * 0.42)

      const addInventoryRow = () => {
        if (!selectedStockName) return Array.isArray(prevSummary.inventory) ? prevSummary.inventory : []

        return [
          {
            id: `stok-${tempId}`,
            transactionId: tempId,
            invoice: tempTransaction.invoice,
            date: tempTransaction.date,
            name: selectedStockName,
            stock: stockQty,
            reorderLevel: 10,
          },
          ...(Array.isArray(prevSummary.inventory) ? prevSummary.inventory : []),
        ]
      }

      const nextSummary = { ...prevSummary }

      switch (newTransaction.businessCategory) {
        case 'Penjualan':
          nextSummary.income += amount
          nextSummary.estimatedHpp += estimatedHpp
          break
        case 'Pemasukan':
          nextSummary.income += amount
          break
        case 'Pengeluaran Operasional':
          nextSummary.operationalExpense += amount
          break
        case 'Beli Bahan Baku / Stok':
          nextSummary.inventory = addInventoryRow()
          nextSummary.estimatedHpp += amount
          break
        case 'Piutang Pelanggan':
          if (newTransaction.isSettled) nextSummary.income += amount
          else nextSummary.receivables += amount
          if (newTransaction.linkedStock) nextSummary.estimatedHpp += estimatedHpp
          break
        case 'Hutang Supplier':
          nextSummary.payables += amount
          nextSummary.inventory = addInventoryRow()
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

    // 2. Perform API call in background/asynchronously to persist to DB
    try {
      const payload = {
        ...newTransaction,
        wallet_id: safeWalletId,
        metadata: transactionMetadata,
      }

      const res = await transactionAPI.create(payload)
      const savedTransaction = normalizeTransaction(res.data)
      const transaction = {
        ...savedTransaction,
        type: savedTransaction.type || tempTransaction.type,
        isUmkm: true,
        businessCategory: savedTransaction.businessCategory || newTransaction.businessCategory,
        stockItemId: savedTransaction.stockItemId || newTransaction.stockItemId,
        stockItemName: savedTransaction.stockItemName || newTransaction.stockItemName,
        stockQty: savedTransaction.stockQty || newTransaction.stockQty,
        // Pakai receipt dari backend, tapi simpan blob lokal sebagai fallback.
        // Jadi gambar nota tetap langsung tampil walaupun link /storage belum bisa diakses browser.
        receipt: savedTransaction.receipt
          ? {
            ...savedTransaction.receipt,
            fallbackUrl: tempTransaction.receipt?.url || tempTransaction.receipt?.preview || tempTransaction.receipt?.fallbackUrl,
            localUrl: tempTransaction.receipt?.url || tempTransaction.receipt?.preview || tempTransaction.receipt?.localUrl,
          }
          : tempTransaction.receipt,
        metadata: {
          ...transactionMetadata,
          ...parseMetadata(savedTransaction.metadata),
        },
      }

      // Replace the optimistic temp transaction with the real transaction from backend
      setUmkmTransactions((prev) => {
        const next = prev.map((t) => t.id === tempId ? transaction : t)
        setUmkmSummary(buildUmkmSummaryFromTransactions(next))
        return next
      })
      setTransactions((prev) => prev.map((t) => t.id === tempId ? transaction : t))

      // Persist debt category in DB if applicable
      if (isDebtCategory) {
        try {
          await mergeOrCreateDebt({
            wallet_id: walletInfo?.id,
            creditor_name: debtTitle,
            amount: amount,
            due_date: formatDateToYMD(newTransaction.date || new Date()),
            note: newTransaction.note || '',
            status: newTransaction.isSettled ? 'paid' : 'active'
          })
        } catch (e) {
          console.error('Error creating debt:', e)
        }
      }

      // Persist Tabungan category into savings report if applicable
      if (isSavingsCategory) {
        try {
          const existingSaving = savings.find((s) => String(s.name || '').trim().toLowerCase() === savingsName.toLowerCase())

          if (existingSaving) {
            await savingAPI.update(existingSaving.id, {
              wallet_id: walletInfo?.id,
              name: existingSaving.name,
              target_amount: Number(existingSaving.target_amount || existingSaving.target || 0),
              current_amount: (Number(existingSaving.current_amount || existingSaving.current || 0) + amount),
              target_date: formatDateToYMD(existingSaving.target_date || existingSaving.deadline),
              category: existingSaving.category || 'Tabungan',
              note: existingSaving.note || String(newTransaction.note || ''),
            })
          } else {
            await savingAPI.create({
              wallet_id: walletInfo?.id,
              name: savingsName,
              target_amount: amount,
              current_amount: amount,
              target_date: formatDateToYMD(newTransaction.date || new Date().toISOString()),
              category: 'Tabungan',
              note: String(newTransaction.note || ''),
            })
          }

          const savingsRes = await savingAPI.list()
          setSavings(savingsRes.data)
        } catch (e) {
          console.error('Error creating saving:', e)
        }
      }

      // Sync wallet balance to ensure it is exact with server
      const walletData = await fetchWalletInfo()
      if (walletData) {
        setWalletInfo(walletData)
        setUmkmEWalletBalance(Number(walletData.balance))
      }

      if (isDebtCategory) {
        setReportsDefaultTab('debt')
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

      if (isDebtCategory) {
        setReportsDefaultTab('debt')
      }
    }
  }

  const normalizeDebt = (debt) => ({
    ...debt,
    creditor: debt.creditor_name || debt.creditor,
    dueDate: debt.due_date || debt.dueDate,
  })

  const mergeOrCreateDebt = async (payload) => {
    const creditorName = String(payload.creditor_name || payload.creditor || '').trim()
    const amount = Number(payload.amount) || 0
    const dueDate = payload.due_date || payload.dueDate || new Date()
    const note = String(payload.note || '').trim()
    const status = payload.status || 'active'

    const existingDebt = debts.find(
      (debt) => String(debt.creditor || '').trim().toLowerCase() === creditorName.toLowerCase()
    )

    if (existingDebt) {
      const existingAmount = Number(existingDebt.amount || 0)
      const existingPaidAmount = Number(existingDebt.paid_amount || existingDebt.paidAmount || 0)
      const updatedPaidAmount = existingPaidAmount + amount
      const updatedStatus = updatedPaidAmount >= existingAmount ? 'paid' : (existingDebt.status || 'active')
      const updatedPayload = {
        wallet_id: payload.wallet_id || existingDebt.wallet_id,
        creditor_name: creditorName,
        amount: existingAmount,
        paid_amount: updatedPaidAmount,
        due_date: formatDateToYMD(existingDebt.dueDate || dueDate),
        note: note || String(existingDebt.note || ''),
        status: updatedStatus,
      }
      const res = await debtAPI.update(existingDebt.id, updatedPayload)
      const normalized = normalizeDebt(res.data)
      setDebts((prev) => prev.map((debt) => debt.id === existingDebt.id ? normalized : debt))
      return normalized
    }

    const res = await debtAPI.create({
      wallet_id: payload.wallet_id,
      creditor_name: creditorName,
      amount,
      due_date: formatDateToYMD(dueDate),
      note,
      status,
    })
    const normalized = normalizeDebt(res.data)
    setDebts((prev) => [...prev, normalized])
    return normalized
  }

  const addDebt = async (newDebt) => {
    try {
      const targetDebt = newDebt?.data || newDebt
      const isPiutang = String(targetDebt?.note || '').toLowerCase().includes('piutang') ||
                        String(targetDebt?.creditor_name || targetDebt?.creditor || '').toLowerCase().includes('piutang')
      
      const targetTab = isPiutang ? 'piutang' : 'debt'

      if (targetDebt && targetDebt.id && !String(targetDebt.id).startsWith('d')) {
        const normalized = normalizeDebt(targetDebt)
        setDebts((prev) => {
          const exists = prev.some((d) => d.id === normalized.id)
          if (exists) {
            return prev.map((d) => (d.id === normalized.id ? normalized : d))
          }
          return [...prev, normalized]
        })
        setReportsDefaultTab(targetTab)
        setCurrentPage('reports')
        return normalized
      }

      const creditor = newDebt.creditor || newDebt.creditor_name
      const dueDate = newDebt.dueDate || newDebt.due_date
      const amount = newDebt.amount
      const note = newDebt.note

      await mergeOrCreateDebt({
        wallet_id: walletInfo?.id,
        creditor_name: creditor,
        amount: amount,
        due_date: dueDate,
        note: note,
        status: 'active'
      })

      setReportsDefaultTab(targetTab)
      setCurrentPage('reports')
    } catch (e) {
      // Hapus alert error sepenuhnya
    }
  }

  const updateDebt = async (id, updates) => {
    try {
      const payload = {
        wallet_id: walletInfo?.id,
        creditor_name: updates.creditor,
        amount: Number(updates.amount),
        due_date: formatDateToYMD(updates.dueDate),
        note: updates.note || '',
        status: updates.status || 'active',
      }
      const res = await debtAPI.update(id, payload)
      const normalized = normalizeDebt(res.data)
      setDebts((prev) => prev.map((debt) => (debt.id === id ? normalized : debt)))
      return normalized
    } catch (e) {
      alert('Gagal memperbarui hutang: ' + (e.message || 'Error tidak diketahui'))
      throw e
    }
  }

  const deleteDebt = async (id) => {
    try {
      await debtAPI.delete(id)
      setDebts((prev) => prev.filter((debt) => debt.id !== id))
    } catch (e) {
      alert('Gagal menghapus hutang: ' + (e.message || 'Error tidak diketahui'))
      throw e
    }
  }

  const addSavings = async (newSavings) => {
    try {
      const payload = {
        wallet_id: walletInfo?.id,
        name: newSavings.name,
        target_amount: newSavings.target,
        current_amount: newSavings.current || 0,
        target_date: formatDateToYMD(newSavings.deadline),
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

  const updateSavings = async (id, updates) => {
    try {
      const payload = {}
      if (updates.name !== undefined) payload.name = updates.name
      if (updates.target !== undefined) payload.target_amount = updates.target
      if (updates.current !== undefined) payload.current_amount = updates.current
      if (updates.deadline !== undefined) payload.target_date = formatDateToYMD(updates.deadline)
      if (updates.category !== undefined) payload.category = updates.category
      if (updates.note !== undefined) payload.note = updates.note

      const res = await savingAPI.update(id, payload)
      const normalized = {
        ...res.data,
        target: res.data.target_amount,
        current: res.data.current_amount,
        deadline: res.data.target_date
      }
      setSavings((prev) => prev.map((saving) => (saving.id === id ? normalized : saving)))
      return normalized
    } catch (e) {
      alert('Gagal memperbarui tabungan: ' + (e.message || 'Error tidak diketahui'))
      throw e
    }
  }

  const deleteSavings = async (id) => {
    try {
      await savingAPI.delete(id)
      setSavings((prev) => prev.filter((saving) => saving.id !== id))
    } catch (e) {
      alert('Gagal menghapus tabungan: ' + (e.message || 'Error tidak diketahui'))
      throw e
    }
  }

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(buildApiUrl(url), {
      ...options,
      headers,
    })
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await authFetch('/api/auth/me', { method: 'GET' })

      if (!res.ok) {
        throw new Error('Gagal mengambil profil user')
      }

      const json = await res.json()
      return json.data
    } catch (e) {
      // Fallback untuk pengembangan lokal bila menggunakan token dev
      try {
        const localToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null
        if (localToken && String(localToken).startsWith('dev-token')) {
          return { name: 'Dev User', username: 'devuser', email: 'devuser@example.com', user_type: 'mahasiswa', role: 'mahasiswa' }
        }
      } catch (err) {
        // ignore
      }
      throw e
    }
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
          username: userProfile.user || userProfile.username,
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
    const balance = Number(data?.wallet?.balance ?? data?.balance ?? 0)
    setInitialBalance(balance)

    if (data?.wallet) {
      setWalletInfo(data.wallet)
    }

    // UMKM: saldo awal harus masuk ke e-wallet UMKM
    // Catatan: jangan masukkan saldo awal ke ringkasan laba/rugi (umkmSummary.income),
    // karena itu membuat fitur 'Laba Rugi Otomatis' ikut terbawa saldo awal.
    if (userProfile?.usertype === 'umkm') {
      setUmkmEWalletBalance(balance)

      setUmkmSummary((prevSummary) => ({
        ...prevSummary,
        // sengaja tidak mengubah prevSummary.income
      }))
    }

    setShowInitialBalance(false)

    // Re-fetch wallet info agar updated
    try {
      const walletData = await fetchWalletInfo()
      if (walletData) {
        setWalletInfo(walletData)
        setInitialBalance(Number(walletData.balance) || balance)
      }
    } catch (e) {
      console.error('Error fetching wallet after initial balance save:', e)
    }

    navigateTo('dashboard')
  }

  const handleLogout = async () => {
    if (token) {
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => { })
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
          return <TransactionsMahasiswaPage transactions={mahasiswaTransactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} onNavigateToReports={(tab) => { setDefaultReportTab(tab); navigateTo('reports'); }} />
        }
        return <TransactionsMasyarakatPage transactions={masyarakatTransactions} filters={filters} setFilters={setFilters} onAddTransaction={addTransaction} />
      case 'analysis':
        if (['masyarakat', 'masyarakat_umum'].includes(userProfile?.usertype)) {
          return <AnalysisMasyarakatPage transactions={masyarakatTransactions} />
        }
        if (userProfile?.usertype === 'mahasiswa') {
          return <AnalysisMahasiswaPage transactions={mahasiswaTransactions} />
        }
        if (userProfile?.usertype === 'umkm') {
          return <AnalysisUMKMPage transactions={umkmTransactions} />
        }
        return <AnalysisPage transactions={userProfile?.usertype === 'mahasiswa' ? mahasiswaTransactions : userProfile?.usertype === 'umkm' ? umkmTransactions : masyarakatTransactions} />
      case 'reports':
        if (userProfile?.usertype === 'umkm') {
          return <ReportsUMKMPage transactions={umkmTransactions} debts={debts} savings={savings} onNavigate={setCurrentPage} onAddSavings={addSavings} onEditSavings={updateSavings} onDeleteSavings={deleteSavings} onEditDebt={updateDebt} onDeleteDebt={deleteDebt} onAddDebt={addDebt} defaultTab={reportsDefaultTab} setDefaultTab={setReportsDefaultTab} />
        }
        if (userProfile?.usertype === 'mahasiswa') {
          return <ReportsMahasiswaPage transactions={mahasiswaTransactions} debts={debts} savings={savings} onNavigate={setCurrentPage} onAddSavings={addSavings} onEditSavings={updateSavings} onDeleteSavings={deleteSavings} onEditDebt={updateDebt} onDeleteDebt={deleteDebt} onAddDebt={addDebt} defaultTab={reportsDefaultTab} setDefaultTab={setReportsDefaultTab} />
        }
        return <ReportsMasyarakatPage transactions={masyarakatTransactions} debts={debts} savings={savings} onNavigate={setCurrentPage} onAddSavings={addSavings} onEditSavings={updateSavings} onDeleteSavings={deleteSavings} onEditDebt={updateDebt} onDeleteDebt={deleteDebt} onAddDebt={addDebt} defaultTab={reportsDefaultTab} setDefaultTab={setReportsDefaultTab} />
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
                setTimeout(() => {
                  try {
                    const incomeCategories = ['Beasiswa', 'Tabungan', 'Uang Saku', 'Penghasilan Kerja Paruh Waktu']
                    const isIncome = incomeCategories.includes(category)
                    window.dispatchEvent(new CustomEvent('quickActionCategory', { detail: { category, type: isIncome ? 'income' : 'expense' } }))
                  } catch (e) {
                    // ignore
                  }
                }, 0)
              }}
            />
          ) : ['masyarakat', 'masyarakat_umum'].includes(userProfile?.usertype) ? (
            <DashboardMasyarakatPage
              walletSummary={{
                current: Number(walletInfo?.balance ?? initialBalance ?? 0),
                income: initialBalance,
                expense: 0,
                smartCashPerDay: Number(walletInfo?.balance ?? initialBalance ?? 0),
                smartReductionPerDay: 0,
              }}
              transactions={masyarakatTransactions}
              budgets={budgets}
              walletInfo={walletInfo}
              userProfile={userProfile}
              onQuickAction={(category) => {
                // Filter harus memakai nama kategori, bukan string 'expense'.
                // Kategori ini sudah disamakan dengan TransactionsMasyarakatPage.jsx.
                setFilters({ type: category })
                navigateTo('transactions')
                setTimeout(() => {
                  try {
                    const incomeCategories = ['Penghasilan Kerja', 'Uang Saku', 'Tabungan']
                    const isIncome = incomeCategories.includes(category)
                    window.dispatchEvent(new CustomEvent('quickActionCategory', { detail: { category, type: isIncome ? 'income' : 'expense' } }))
                  } catch (e) { }
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
  }, [currentPage, isAuthenticated, showUserType, showLanding, showInitialBalance, initialBalance, filters, selectedUmkmCategory, transactions, umkmTransactions, debts, savings, budgets, userProfile, walletInfo, umkmSummary, umkmEWalletBalance])

  if (showSplash) {
    return <SplashScreen />
  }

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
