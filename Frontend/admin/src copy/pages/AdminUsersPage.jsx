import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'


function formatMoney(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

function AdminUsersPage() {
  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [userType, setUserType] = useState('')
  const [isActive, setIsActive] = useState('')

  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', user_type: '', is_active: true })

  // Custom confirm modal state (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null })

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

      const url = `${backendUrl}/api/admin/users?${params.toString()}`

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

  const handleToggleSuspend = (user) => {
    setConfirmModal({ show: true, user })
  }

  const confirmToggleSuspend = async () => {
    const user = confirmModal.user
    if (!user) return
    setConfirmModal({ show: false, user: null })
    
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${user.id}`, {
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
          user_type: user.role === 'admin' ? null : (user.user_type || 'masyarakat_umum'),
          is_active: !user.is_active,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal mengubah status user')
      
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)))
    } catch (e) {
      // Show error inline instead of alert
      setError(e.message)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${editingUser.id}`, {
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
      setError(e.message)
    }
  }

  const visibleUsers = users

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Data Pengguna</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola user: lihat, edit, suspend/nonaktifkan, atau delete.</p>
      </div>

      {/* Filters */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pencarian</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama / email / username"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
            >
              <option value="">Semua Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tipe Pengguna</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
            >
              <option value="">Semua Tipe</option>
              <option value="umkm">UMKM</option>
              <option value="masyarakat_umum">Masyarakat Umum</option>
              <option value="mahasiswa">Mahasiswa</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => loadUsers(false)}
            className="rounded-2xl bg-[#38ADA9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Terapkan
          </button>
          <button
            onClick={resetFilters}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
            Memuat data pengguna...
          </div>
        </div>
      ) : (
        <div className="w-full rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="overflow-x-auto max-h-[600px] w-full">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 sticky top-0 z-10 shadow-[0_1px_0_rgba(203,213,225,1)]">
                <tr>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Username</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tipe</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers?.length ? (
                  visibleUsers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100 hover:bg-[#38ADA9]/5 transition-colors duration-200">
                      <td className="p-4 text-slate-500 font-mono text-xs">{u.id}</td>
                      <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4 text-slate-600">{u.username}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{u.user_type ?? '-'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                            onClick={() => handleEditClick(u)}
                          >
                            Edit
                          </button>
                          <button
                            className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 ${
                              u.is_active
                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
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
                    <td className="p-10 text-center text-slate-400 italic" colSpan={8}>
                      Tidak ada data pengguna.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Suspend/Activate Modal (replaces window.confirm) */}
      {confirmModal.show && confirmModal.user && createPortal(
        <div className="!fixed !inset-0 !w-screen !h-screen !z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in-up">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative overflow-hidden border border-slate-100/80">
            {/* Status-colored Top Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${confirmModal.user.is_active ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confirmModal.user.is_active ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                {confirmModal.user.is_active ? (
                  <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Yakin ingin <strong>{confirmModal.user.is_active ? 'suspend' : 'aktifkan'}</strong> user <strong>{confirmModal.user.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, user: null })}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleSuspend}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
                  confirmModal.user.is_active ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                }`}
              >
                {confirmModal.user.is_active ? 'Suspend' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal */}
      {/* Edit Modal */}
      {editingUser && createPortal(
        <div className="!fixed !inset-0 !w-screen !h-screen !z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Edit Pengguna</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-1.5 block">NAMA</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-transparent focus:outline-none focus:border-[#38ADA9] focus:ring-1 focus:ring-[#38ADA9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-1.5 block">EMAIL</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-transparent focus:outline-none focus:border-[#38ADA9] focus:ring-1 focus:ring-[#38ADA9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-1.5 block">ROLE</label>
                <select
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-transparent focus:outline-none focus:border-[#38ADA9] focus:ring-1 focus:ring-[#38ADA9] transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editForm.role === 'user' && (
                <div>
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-1.5 block">TIPE PENGGUNA</label>
                  <select
                    required
                    value={editForm.user_type}
                    onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-transparent focus:outline-none focus:border-[#38ADA9] focus:ring-1 focus:ring-[#38ADA9] transition-colors"
                  >
                    <option value="" disabled>Pilih Tipe</option>
                    <option value="umkm">UMKM</option>
                    <option value="masyarakat_umum">Masyarakat Umum</option>
                    <option value="mahasiswa">Mahasiswa</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-1.5 block">STATUS</label>
                <select
                  required
                  value={editForm.is_active ? '1' : '0'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-transparent focus:outline-none focus:border-[#38ADA9] focus:ring-1 focus:ring-[#38ADA9] transition-colors"
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-medium rounded-xl transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminUsersPage
