function BudgetCard({ category, usage, limit, children }) {
  const progress = limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : usage > 0 ? 100 : 0
  const isExceeded = limit > 0 ? usage > limit : usage > 0
  const progressClasses = isExceeded ? 'bg-rose-500' : 'bg-brand-500'

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{category}</p>
            <p className="mt-1 text-sm text-slate-500">{isExceeded ? 'Terlampaui' : 'Dalam batas'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {progress}%
            </span>
            {children}
          </div>
        </div>

        <div className="rounded-full bg-slate-100 h-3 overflow-hidden">
          <div className={`h-3 rounded-full ${progressClasses}`} style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Digunakan: Rp {usage.toLocaleString('id-ID')}</span>
          <span>Limit: Rp {limit.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
