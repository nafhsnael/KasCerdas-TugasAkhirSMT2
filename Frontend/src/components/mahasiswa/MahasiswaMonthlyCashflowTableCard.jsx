import { useMemo } from 'react'

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MahasiswaMonthlyCashflowTableCard({ transactions, periodLabel, compact = false }) {
  const stats = useMemo(() => {
    const isInitialBalanceTx = (t) => {
      const title = String(t?.title || '').trim().toLowerCase()
      const category = String(t?.category || '').trim().toLowerCase()
      const note = String(t?.note || '').trim().toLowerCase()
      return (
        title === 'initial' || title === 'initial balance' || title === 'saldo awal' ||
        category === 'initial' || category === 'initial balance' || category === 'saldo awal' ||
        note === 'initial' || note === 'initial balance' || note === 'saldo awal'
      )
    }

    const tx = (Array.isArray(transactions) ? transactions : []).filter((t) => !isInitialBalanceTx(t))

    const incomes = tx.filter((t) => t?.type === 'income')
    const expenses = tx.filter((t) => t?.type === 'expense')

    const incomeAvg = incomes.length ? incomes.reduce((s, t) => s + (Number(t.amount) || 0), 0) / incomes.length : 0
    const expenseAvg = expenses.length ? expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0) / expenses.length : 0

    const netCashFlow = incomeAvg - expenseAvg

    const perTxNet = tx
      .map((t) => {
        const amt = Number(t?.amount) || 0
        if (t?.type === 'income') return amt
        if (t?.type === 'expense') return -amt
        return 0
      })
      .filter((v) => typeof v === 'number' && !Number.isNaN(v))

    const highestNet = perTxNet.length ? Math.max(...perTxNet) : 0
    const lowestNet = perTxNet.length ? Math.min(...perTxNet) : 0

    return {
      incomeAvg,
      expenseAvg,
      netCashFlow,
      highestNet,
      lowestNet,
    }
  }, [transactions])

  const isNegative = stats.netCashFlow < 0

  const cards = [
    {
      label: 'Rata-rata pemasukan',
      value: formatRp(stats.incomeAvg),
      valueClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      ),
    },
    {
      label: 'Rata-rata pengeluaran',
      value: formatRp(stats.expenseAvg),
      valueClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      ),
    },
    {
      label: 'Rata-rata arus kas bersih',
      value: formatRp(stats.netCashFlow),
      valueClass: isNegative ? 'text-rose-600' : 'text-[#2563EB]',
      bgClass: 'bg-blue-50',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m9 0L12 21m0 0l-4.5-4.5M12 21V7.5" />
        </svg>
      ),
    },
    {
      label: 'Arus kas tertinggi',
      value: formatRp(stats.highestNet),
      valueClass: stats.highestNet < 0 ? 'text-rose-600' : 'text-emerald-700',
      bgClass: 'bg-indigo-50',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      label: 'Arus kas terendah',
      value: formatRp(stats.lowestNet),
      valueClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
        </svg>
      ),
    },
  ]

  return (
    <section className={`rounded-[20px] bg-white shadow-sm border border-slate-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Arus Kas Bulanan Mahasiswa</p>
        <h3 className={`mt-2 font-semibold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>{periodLabel || 'Periode Terpilih'}</h3>
        <p className={`mt-2 text-sm text-slate-500 ${compact ? 'hidden' : ''}`}>Ringkasan kondisi arus kas pengguna berdasarkan periode yang dipilih</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`group rounded-2xl bg-white border border-slate-200 shadow-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${c.bgClass} ${c.iconClass}`}>
                {c.icon}
              </div>
            </div>

            <div className="mt-4 min-w-0">
              <div className={`text-lg font-bold sm:text-xl lg:text-xs xl:text-sm 2xl:text-base truncate ${c.valueClass}`} title={c.value}>{c.value}</div>
              <div className="mt-2 text-xs text-slate-500 truncate" title={c.label}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MahasiswaMonthlyCashflowTableCard

