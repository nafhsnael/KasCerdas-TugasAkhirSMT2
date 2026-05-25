import { useMemo } from 'react'

function BiggestExpenseCard({ transactions }) {
  const { biggestCategory, biggestAmount, percentOfTotal, hasData } = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    const expenseTx = tx.filter((t) => t?.type === 'expense')

    if (expenseTx.length === 0) {
      return {
        biggestCategory: '-',
        biggestAmount: 0,
        percentOfTotal: 0,
        hasData: false,
      }
    }

    const totalExpense = expenseTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const byCategory = new Map()
    for (const t of expenseTx) {
      const cat = t.category || '-' 
      const prev = byCategory.get(cat) ?? 0
      byCategory.set(cat, prev + (Number(t.amount) || 0))
    }

    let maxCat = '-'
    let maxAmount = 0
    for (const [cat, amount] of byCategory.entries()) {
      if (amount > maxAmount) {
        maxAmount = amount
        maxCat = cat
      }
    }

    const percent = totalExpense > 0 ? (maxAmount / totalExpense) * 100 : 0

    return {
      biggestCategory: maxCat,
      biggestAmount: maxAmount,
      percentOfTotal: percent,
      hasData: true,
    }
  }, [transactions])

  const percentText = `${hasData ? percentOfTotal.toFixed(0) : 0}%`

  return (
    <div
      className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ boxShadow: '0 10px 25px rgba(2, 6, 23, 0.06)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500">Pos Pengeluaran Terbesar</p>
          <h3 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A' }} className="mt-2 leading-tight">
            {hasData ? biggestCategory : '-'}
          </h3>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p style={{ color: '#0F172A' }} className="mt-1 text-[18px] font-semibold leading-tight">
                Rp {hasData ? biggestAmount.toLocaleString('id-ID') : '0'}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">Kategori dengan pengeluaran paling dominan</p>
            </div>

            <div
              className="rounded-2xl px-3 py-2 font-semibold"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiggestExpenseCard

