function TopBar({ currentPage }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-xl md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{currentPage}</h1>
      </div>
    </div>
  )
}

export default TopBar
