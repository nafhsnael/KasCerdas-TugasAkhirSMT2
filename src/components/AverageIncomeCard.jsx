import { useMemo } from 'react'

function AverageIncomeCard({ transactions }) {
  const now = new Date()

  const { averageIncome, percentChange, trend } = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { averageIncome: 0, percentChange: 0, trend: 'up' }
    }

    // Group income totals by YYYY-MM
    const incomeByMonth = new Map()
    const monthSet = new Set()

    for (const t of transactions) {
      const d = new Date(t.date)
      if (Number.isNaN(d.getTime())) continue

      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthSet.add(ym)

      if (t.type === 'income') {
        const prev = incomeByMonth.get(ym) ?? 0
        incomeByMonth.set(ym, prev + (Number(t.amount) || 0))
      }
    }

    const totalMonths = monthSet.size || 1
    const totalIncome = Array.from(incomeByMonth.values()).reduce((sum, v) => sum + v, 0)
    const avg = totalIncome / totalMonths

    // Determine latest and previous months based on monthSet order
    const sortedMonths = Array.from(monthSet)
      .sort((a, b) => {
        // a,b are YYYY-MM
        return a.localeCompare(b)
      })

    const lastMonth = sortedMonths[sortedMonths.length - 1]
    const prevMonth = sortedMonths.length > 1 ? sortedMonths[sortedMonths.length - 2] : null

    const lastIncome = incomeByMonth.get(lastMonth) ?? 0
    const prevIncome = prevMonth ? incomeByMonth.get(prevMonth) ?? 0 : 0

    if (!prevMonth) {
      return { averageIncome: avg, percentChange: 0, trend: 'up' }
    }

    if (prevIncome === 0) {
      // “sesuaikan aja”: if previous income is 0, treat as naik when lastIncome>0, otherwise flat/↓
      if (lastIncome > 0) {
        return { averageIncome: avg, percentChange: 100, trend: 'up' }
      }
      return { averageIncome: avg, percentChange: 0, trend: 'down' }
    }

    const pct = ((lastIncome - prevIncome) / prevIncome) * 100
    return { averageIncome: avg, percentChange: pct, trend: pct >= 0 ? 'up' : 'down' }
  }, [transactions])

  const isUp = trend === 'up'

  const formatMoney = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
  const formatPercent = (n) => {
    const sign = n > 0 ? '+' : ''
    return `${sign}${n.toFixed(1)}%`
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <span style={{ color: '#16A34A', fontSize: 24 }}>
            
            
            
            
          </span>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7.5C4 6.11929 5.11929 5 6.5 5H19.5C20.8807 5 22 6.11929 22 7.5V16.5C22 17.8807 20.8807 19 19.5 19H6.5C5.11929 19 4 17.8807 4 16.5V7.5Z"
              stroke="#16A34A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M8 9.5H16"
              stroke="#16A34A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16.2" cy="13.2" r="1.4" fill="#16A34A" />
          </svg>
        </div>

        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Rata-rata Pemasukan</p>
          <div className="mt-2 flex items-baseline justify-between gap-4">
            <h3 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>
              {formatMoney(averageIncome)}
            </h3>

            <div
              className="rounded-2xl px-3 py-2 text-sm font-semibold"
              style={{ color: isUp ? '#16A34A' : '#DC2626', backgroundColor: isUp ? '#DCFCE7' : '#FEE2E2' }}
            >
              <span>{formatPercent(Math.abs(percentChange))}</span>
              <span className="ml-1">{isUp ? 'Naik' : percentChange === 0 ? 'Stabil' : 'Turun'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AverageIncomeCard

