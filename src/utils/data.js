export const walletSummary = {
  current: 7250000,
  income: 12500000,
  expense: 5300000,
}

export const transactions = [
  {
    id: 't1',
    title: 'Makan siang',
    category: 'Makan',
    wallet: 'Cash',
    date: '2026-04-24',
    note: 'Nasi ayam geprek',
    amount: 45000,
    type: 'expense',
  },
  {
    id: 't2',
    title: 'Pendapatan proyek',
    category: 'Lainnya',
    wallet: 'Bank',
    date: '2026-04-23',
    note: 'Transfer klien',
    amount: 1500000,
    type: 'income',
  },
  {
    id: 't3',
    title: 'Transportasi',
    category: 'Transport',
    wallet: 'Ovo',
    date: '2026-04-22',
    note: 'Grab ke kantor',
    amount: 32000,
    type: 'expense',
  },
  {
    id: 't4',
    title: 'Streaming & hiburan',
    category: 'Hiburan',
    wallet: 'Dana',
    date: '2026-04-22',
    note: 'Langganan musik',
    amount: 75000,
    type: 'expense',
  },
]

export const budgets = [
  { category: 'Makan', limit: 1000000, usage: 860000 },
  { category: 'Hiburan', limit: 500000, usage: 450000 },
  { category: 'Transport', limit: 700000, usage: 240000 },
  { category: 'Belanja', limit: 1500000, usage: 830000 },
]

export const reports = {
  daily: {
    summary: 'Pemasukan 1.500.000',
    details: [
      { title: 'Pengeluaran hari ini', value: 'Rp 345.000' },
      { title: 'Sisa saldo harian', value: 'Rp 1.155.000' },
      { title: 'Jumlah transaksi', value: '8 transaksi' },
    ],
  },
  monthly: {
    summary: 'Saldo bulanan stabil',
    details: [
      { title: 'Pemasukan bulan ini', value: 'Rp 12.500.000' },
      { title: 'Pengeluaran bulan ini', value: 'Rp 5.300.000' },
      { title: 'Saldo tersisa', value: 'Rp 7.250.000' },
    ],
  },
  annual: {
    summary: 'Proyeksi tabungan naik 18%',
    details: [
      { title: 'Pemasukan tahunan', value: 'Rp 145.000.000' },
      { title: 'Pengeluaran tahunan', value: 'Rp 78.000.000' },
      { title: 'Target tabungan', value: 'Rp 35.000.000' },
    ],
  },
  debt: {
    summary: '2 hutang aktif',
    details: [
      { title: 'Hutang keluarga', value: 'Rp 3.000.000' },
      { title: 'Hutang teman', value: 'Rp 800.000' },
      { title: 'Total hutang', value: 'Rp 3.800.000' },
    ],
  },
  savings: {
    summary: 'Target tabungan tercapai 65%',
    details: [
      { title: 'Tabungan saat ini', value: 'Rp 21.000.000' },
      { title: 'Target akhir tahun', value: 'Rp 32.000.000' },
      { title: 'Sisa untuk tercapai', value: 'Rp 11.000.000' },
    ],
  },
}
