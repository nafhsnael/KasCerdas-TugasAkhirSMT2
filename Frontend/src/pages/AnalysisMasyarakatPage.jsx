import { useMemo, useState } from 'react'

import MasyarakatMonthlyCashflowTableCard from '../components/masyarakat/MasyarakatMonthlyCashflowTableCard'
import MasyarakatExpenseCompositionCard from '../components/masyarakat/MasyarakatExpenseCompositionCard'
import MasyarakatIncomeCompositionCard from '../components/masyarakat/MasyarakatIncomeCompositionCard'
import MasyarakatPeriodDevelopmentCard from '../components/masyarakat/MasyarakatPeriodDevelopmentCard'


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
  const endOfYear = (d) => endOfDay(new Date(d.getFullYear(), 11, 31))

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

function AnalysisMasyarakatPage({ transactions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan_ini')

  const { label, currentStart, currentEnd, previousStart, previousEnd } = useMemo(
    () => getPeriodRanges(selectedPeriod),
    [selectedPeriod]
  )

  const filteredTransactions = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    return tx.filter((t) => isTxInRange(t, currentStart, currentEnd))
  }, [transactions, currentStart, currentEnd])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-3 pt-6 pb-6 sm:px-4 lg:px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ANALISIS KEUANGAN</p>
              <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
                Analisis Keuangan Masyarakat
              </h1>
              <p className="mt-2 text-[16px] leading-6 text-[#64748B]">
                Pantau kondisi keuangan Anda secara ringkas dan jelas untuk membantu pengelolaan keuangan pribadi yang lebih baik.
              </p>


            </div>

            <div className="flex shrink-0 items-center">
              <div className="h-[48px] w-[320px] rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
                <div className="flex h-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                      <path d="M6 9L12 15L18 9" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <MasyarakatMonthlyCashflowTableCard
                transactions={filteredTransactions}
                periodLabel={label}
                compact
              />
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 px-2">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Komposisi Pengeluaran per Pos
                </p>
              </div>

              <div className="min-w-0">
                <MasyarakatExpenseCompositionCard
                  transactions={filteredTransactions}
                  periodLabel={label}
                  compact
                  categories={[
                    'Makan',
                    'Hutang',
                    'Transport',
                    'Belanja',
                    'Tagihan',
                    'Kebutuhan Lainnya',
                  ]}
                />
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 px-2">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Komposisi Pemasukan per Pos
                </p>
              </div>

              <div className="min-w-0">
                <MasyarakatIncomeCompositionCard
                  transactions={filteredTransactions}
                  periodLabel={label}
                  compact
                />
              </div>
            </section>
          </div>

          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-6">
              <MasyarakatPeriodDevelopmentCard
                transactions={transactions}
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

export default AnalysisMasyarakatPage