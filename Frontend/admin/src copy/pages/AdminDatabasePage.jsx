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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Inspector</h1>
          <p className="mt-1 text-sm text-slate-500">Lihat isi tabel database langsung dari dashboard (Read-Only).</p>
        </div>
        <button 
          onClick={loadTables}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Refresh Daftar Tabel
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Table List Sidebar */}
        <div className="space-y-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Daftar Tabel</h3>
            {loading ? (
              <p className="text-sm text-slate-500">Memuat...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="space-y-1">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => loadTableData(table.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                      selectedTable === table.name
                        ? 'bg-[#38ADA9] text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{table.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedTable === table.name ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
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
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400">
              <span className="text-4xl mb-2">📁</span>
              <p>Pilih tabel untuk melihat datanya</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  Data Tabel: <span className="text-[#38ADA9]">{selectedTable}</span>
                </h3>
                {loadingTable && (
                  <span className="text-xs text-slate-500 animate-pulse">Memuat data...</span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {tableData && tableData.length > 0 ? (
                        Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                            {key}
                          </th>
                        ))
                      ) : (
                        <th className="p-4 text-slate-500 italic">No data columns available</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTable ? (
                      <tr>
                        <td className="p-8 text-center text-slate-400" colSpan={100}>
                          Sedang mengambil data terbaru...
                        </td>
                      </tr>
                    ) : tableData && tableData.length > 0 ? (
                      tableData.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="p-3 text-slate-600 truncate max-w-[200px]">
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
                        <td className="p-8 text-center text-slate-500" colSpan={100}>
                          Tabel ini tidak memiliki data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 italic">
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
