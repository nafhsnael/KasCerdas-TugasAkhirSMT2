function StatCard({ label, value, description }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[14px] tracking-[0.04em] font-semibold text-slate-500">{label}</p>
      <h3 className="mt-2 text-[22px] font-semibold text-slate-900">{value}</h3>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export default StatCard
