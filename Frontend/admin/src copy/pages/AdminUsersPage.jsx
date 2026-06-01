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

  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', user_type: '', is_active: true })

  const token = useMemo(() => {
    try {
      return window.localStorage.getItem('token')
    } catch {
      return null
    }
  }, [])

  const loadUsers = async (isReset = false) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.append('per_page', '1000') // Show all users instead of default 10
      
      if (isReset !== true) {
        if (search) params.append('search', search)
        if (role) params.append('role', role)
        if (userType) params.append('user_type', userType)
        if (isActive !== '') params.append('is_active', isActive)
      }

      const url = `/api/admin/users?${params.toString()}`

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
    loadUsers(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetFilters = () => {
    setSearch('')
    setRole('')
    setUserType('')
    setIsActive('')
    loadUsers(true)
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      user_type: user.user_type || '',
      is_active: user.is_active ? true : false,
    })
  }

  const handleToggleSuspend = async (user) => {
    if (!window.confirm(`Yakin ingin ${user.is_active ? 'suspend' : 'aktifkan'} user ${user.name}?`)) return
    
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          user_type: user.role === 'admin' ? null : (user.user_type || 'masyarakat_umum'), // default to masyarakat_umum if empty for users
          is_active: !user.is_active,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal mengubah status user')
      
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)))
    } catch (e) {
      alert(e.message)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...editForm,
          user_type: editForm.role === 'admin' ? null : editForm.user_type
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan user')
      
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...editForm, user_type: editForm.role === 'admin' ? null : editForm.user_type } : u)))
      setEditingUser(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const visibleUsers = users

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Data Pengguna</h1>
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
            onClick={() => loadUsers(false)}
            className="rounded-lg bg-[#38ADA9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2e8b87]"
          >
            Terapkan
          </button>
          <button
            onClick={resetFilters}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-auto max-h-[600px]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_rgba(203,213,225,1)]">
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
                            onClick={() => handleEditClick(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => handleToggleSuspend(u)}
                            disabled={u.role === 'admin'}
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Edit User</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nama</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                <select
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editForm.role === 'user' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">User Type</label>
                  <select
                    required
                    value={editForm.user_type}
                    onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
                  >
                    <option value="" disabled>Pilih Tipe</option>
                    <option value="umkm">UMKM</option>
                    <option value="masyarakat_umum">Masyarakat Umum</option>
                    <option value="mahasiswa">Mahasiswa</option>
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  required
                  value={editForm.is_active ? '1' : '0'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20"
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#38ADA9] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e8b87]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage

