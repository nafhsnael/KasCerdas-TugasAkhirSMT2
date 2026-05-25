import { useEffect, useMemo, useState } from 'react'

function formatMoney(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [userType, setUserType] = useState('')
  const [isActive, setIsActive] = useState('')

  const token = useMemo(() => {
    try {
      return window.localStorage.getItem('token')
    } catch {
      return null
    }
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (role) params.append('role', role)
      if (userType) params.append('user_type', userType)
      if (isActive !== '') params.append('is_active', isActive)

      const url = params.toString() ? `/api/admin/users?${params}` : '/api/admin/users'

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil users')
      const data = json?.data || json
      setUsers(data?.users || data?.items || data?.data || data || [])
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleUsers = users

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users (Admin)</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola user: lihat, edit, suspend/nonaktifkan, atau delete.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="nama/email/username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
            >
              <option value="">All</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
            >
              <option value="">All</option>
              <option value="umkm">umkm</option>
              <option value="masyarakat_umum">masyarakat_umum</option>
              <option value="mahasiswa">mahasiswa</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
            >
              <option value="">All</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={loadUsers}
            className="rounded-lg bg-[#38ADA9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2e8b87]"
          >
            Terapkan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">ID</th>
                  <th className="p-4 font-semibold text-slate-700">Nama</th>
                  <th className="p-4 font-semibold text-slate-700">Email</th>
                  <th className="p-4 font-semibold text-slate-700">Username</th>
                  <th className="p-4 font-semibold text-slate-700">Role</th>
                  <th className="p-4 font-semibold text-slate-700">User Type</th>
                  <th className="p-4 font-semibold text-slate-700">Status</th>
                  <th className="p-4 font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers?.length ? (
                  visibleUsers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="p-4 text-slate-600">{u.id}</td>
                      <td className="p-4 text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4 text-slate-600">{u.username}</td>
                      <td className="p-4 text-slate-600">{u.role}</td>
                      <td className="p-4 text-slate-600">{u.user_type ?? '-'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => alert('Edit user belum diimplementasi (minimal UI)')}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => alert('Suspend/Activate belum diimplementasi (minimal UI)')}
                          >
                            {u.is_active ? 'Suspend' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan={8}>
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage

