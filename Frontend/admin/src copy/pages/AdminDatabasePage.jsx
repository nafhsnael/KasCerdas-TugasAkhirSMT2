import { useEffect, useState, useMemo } from 'react'

function DatabasePage() {
  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [loadingTable, setLoadingTable] = useState(false)

  const token = useMemo(() => {
    try {
      return window.localStorage.getItem('token')
    } catch {
      return null
    }
  }, [])

  const loadTables = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backendUrl}/api/admin/monitoring/database/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil daftar tabel')
      setTables(json?.data || [])
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async (tableName) => {
    setLoadingTable(true)
    setSelectedTable(tableName)
    try {
      const res = await fetch(`${backendUrl}/api/admin/monitoring/database/tables/${tableName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil data tabel')
      setTableData(json?.data?.data || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setLoadingTable(false)
    }
  }

  useEffect(() => {
    loadTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Inspector</h1>
          <p className="mt-1 text-sm text-slate-500">Lihat isi tabel database langsung dari dashboard (Read-Only).</p>
        </div>
        <button 
          onClick={loadTables}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Refresh Daftar Tabel
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Table List Sidebar */}
        <div className="space-y-2">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Daftar Tabel</h3>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
                Memuat...
              </div>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="space-y-1.5">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => loadTableData(table.name)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm transition-all duration-300 ${
                      selectedTable === table.name
                        ? 'bg-[#38ADA9] text-white shadow-md scale-[1.02]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02]'
                    }`}
                  >
                    <span className="truncate font-medium">{table.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      selectedTable === table.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {table.rows}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data View Area */}
        <div className="space-y-4">
          {!selectedTable ? (
            <div className="flex flex-col items-center justify-center h-72 rounded-[32px] border-2 border-dashed border-slate-200 bg-white text-slate-400 shadow-sm">
              {/* SVG Database Icon */}
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
              </svg>
              <p className="text-sm font-medium">Pilih tabel untuk melihat datanya</p>
            </div>
          ) : (
            <div className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-slate-50/50 border-b border-slate-200 p-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Data Tabel: <span className="text-[#38ADA9]">{selectedTable}</span>
                </h3>
                {loadingTable && (
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
                    Memuat data...
                  </span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      {tableData && tableData.length > 0 ? (
                        Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="p-4 font-semibold text-slate-600 whitespace-nowrap uppercase tracking-wider text-[11px]">
                            {key}
                          </th>
                        ))
                      ) : (
                        <th className="p-4 text-slate-500 italic">Tidak ada kolom data</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTable ? (
                      <tr>
                        <td className="p-10 text-center text-slate-400" colSpan={100}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
                            Sedang mengambil data terbaru...
                          </div>
                        </td>
                      </tr>
                    ) : tableData && tableData.length > 0 ? (
                      tableData.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-[#38ADA9]/5 transition-colors duration-200">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="p-4 text-slate-600 truncate max-w-[200px]">
                              {val === null ? (
                                <span className="text-slate-300 italic">null</span>
                              ) : typeof val === 'object' ? (
                                JSON.stringify(val)
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-10 text-center text-slate-400 italic" colSpan={100}>
                          Tabel ini tidak memiliki data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-200 text-[11px] text-slate-400 italic">
                * Menampilkan 10 data terbaru. Untuk query kompleks, gunakan phpMyAdmin.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatabasePage
