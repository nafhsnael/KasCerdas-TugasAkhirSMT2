import StatCard from '../components/StatCard'
import BiggestExpenseCard from '../components/BiggestExpenseCard'
import MonthlyCashflowTableCard from '../components/MonthlyCashflowTableCard'
import ExpenseCompositionCard from '../components/ExpenseCompositionCard'
import PeriodDevelopmentCard from '../components/PeriodDevelopmentCard'

import { useMemo, useState } from 'react'

const PERIOD_OPTIONS = [
  { key: 'bulan_ini', label: 'Bulan Ini' },
  { key: 'bulan_kemarin', label: 'Bulan Kemarin' },
  { key: '3_bulan_terakhir', label: '3 Bulan Terakhir' },
  { key: '6_bulan_terakhir', label: '6 Bulan Terakhir' },
  { key: 'tahun_ini', label: 'Tahun Ini' },
]

function getPeriodRanges(periodKey) {
  const now = new Date()

  const endOfDay = (d) => {
    const x = new Date(d)
    x.setHours(23, 59, 59, 999)
    return x
  }

  const startOfDay = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }

  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
  const endOfMonth = (d) => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0))

  const startOfYear = (d) => new Date(d.getFullYear(), 0, 1)
  const endOfYear = (d) => {
    // sesuai keputusan: sampai 31 Des
    return endOfDay(new Date(d.getFullYear(), 11, 31))
  }

  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStart = startOfMonth(prevMonthDate)
  const prevMonthEnd = endOfMonth(prevMonthDate)

  if (periodKey === 'bulan_ini') {
    return {
      label: '',
      currentStart: startOfDay(currentMonthStart),
      currentEnd: currentMonthEnd,
      previousStart: startOfDay(prevMonthStart),
      previousEnd: prevMonthEnd,
    }
  }

  if (periodKey === 'bulan_kemarin') {
    const prev2MonthDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const prev2MonthStart = startOfMonth(prev2MonthDate)
    const prev2MonthEnd = endOfMonth(prev2MonthDate)

    return {
      label: 'Bulan Kemarin',
      currentStart: startOfDay(prevMonthStart),
      currentEnd: prevMonthEnd,
      previousStart: startOfDay(prev2MonthStart),
      previousEnd: prev2MonthEnd,
    }
  }

  if (periodKey === '3_bulan_terakhir') {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const prevEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - 3, 0))

    return {
      label: '3 Bulan Terakhir',
      currentStart: startOfDay(start),
      currentEnd: currentMonthEnd,
      previousStart: startOfDay(prevStart),
      previousEnd: prevEnd,
    }
  }

  if (periodKey === '6_bulan_terakhir') {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const prevEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - 6, 0))

    return {
      label: '6 Bulan Terakhir',
      currentStart: startOfDay(start),
      currentEnd: currentMonthEnd,
      previousStart: startOfDay(prevStart),
      previousEnd: prevEnd,
    }
  }

  // tahun_ini
  return {
    label: 'Tahun Ini',
    currentStart: startOfDay(startOfYear(now)),
    currentEnd: endOfYear(now),
    previousStart: startOfDay(new Date(now.getFullYear() - 1, 0, 1)),
    previousEnd: endOfDay(new Date(now.getFullYear() - 1, 11, 31)),
  }
}

function isTxInRange(tx, start, end) {
  const d = new Date(tx?.date)
  if (Number.isNaN(d.getTime())) return false
  return d >= start && d <= end
}

function AnalysisPage({ transactions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan_ini')

  const { label, currentStart, currentEnd, previousStart, previousEnd } = useMemo(
    () => getPeriodRanges(selectedPeriod),
    [selectedPeriod]
  )

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

  const cleanTransactions = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    return tx.filter((t) => !isInitialBalanceTx(t))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return cleanTransactions.filter((t) => isTxInRange(t, currentStart, currentEnd))
  }, [cleanTransactions, currentStart, currentEnd])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-3 pt-6 pb-6 sm:px-4 lg:px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
                Analisis Keuangan
              </h1>
              <p className="mt-2 text-[16px] leading-6 text-[#64748B]">
                Analisis keuangan membantu pengguna memantau kondisi keuangan secara ringkas dan jelas
              </p>
            </div>

            <div className="flex shrink-0 items-center">
              <div className="h-[48px] w-[320px] rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
                <div className="flex h-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-[#0F172A]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 2V4"
                          stroke="#0F172A"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 2V4"
                          stroke="#0F172A"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 9H21"
                          stroke="#0F172A"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5Z"
                          stroke="#0F172A"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <select
                        aria-label="Pilih Periode"
                        className="w-full bg-transparent text-[15px] font-semibold text-slate-800 outline-none appearance-none"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                      >
                        {PERIOD_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.key === 'bulan_ini' ? 'Pilih periode (bulan ini)' : opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="#475569"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <MonthlyCashflowTableCard transactions={filteredTransactions} periodLabel={label} compact />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Komposisi Pengeluaran per Pos</p>
            </div>

            <div className="min-w-0">
              <ExpenseCompositionCard transactions={filteredTransactions} periodLabel={label} compact />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-6">
              <PeriodDevelopmentCard
                transactions={cleanTransactions}
                periodLabel={label}
                currentStart={currentStart}
                currentEnd={currentEnd}
                previousStart={previousStart}
                previousEnd={previousEnd}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
