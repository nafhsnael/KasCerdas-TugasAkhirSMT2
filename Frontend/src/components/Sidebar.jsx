import { useState } from 'react'
import logoImg from '../image/logo.jpg'

function Sidebar({ currentPage, onNavigate, userProfile, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analysis', label: 'Analisis' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'reports', label: 'Laporan' },
    { id: 'budget', label: 'Budget' },
    { id: 'profile', label: 'Profil' },
  ]

  return (
    <div className={`fixed left-0 top-0 flex flex-col transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#38ADA9] to-[#2e8b87] text-white h-screen shadow-lg z-10`}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center">
              <img
                src={logoImg}
                alt="KasCerdas"
                className="h-8 w-8 object-contain"
              />
            </div>
            {isExpanded && (
              <div className="text-white">
                <span className="text-lg font-semibold leading-tight">KasCerdas</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          {isExpanded ? '✕' : '☰'}
        </button>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-[#F6B93B]/20 ${!isExpanded && 'flex justify-center'}`}>
        <div className="flex items-center gap-3">
          {userProfile?.profileImage && (
            <img
              src={userProfile.profileImage}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover border-2 border-[#F6B93B]"
            />
          )}
          {isExpanded && (
            <div className="flex-1">
              <p className="font-semibold text-sm">{userProfile?.nama}</p>
              <p className="text-xs text-white/70">{userProfile?.user}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              currentPage === item.id
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isExpanded && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white/80 hover:bg-white/10 transition ${
            !isExpanded && 'justify-center'
          }`}
        >
          <span className="text-xl"></span>
          {isExpanded && <span>Logout</span>}
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="!fixed !inset-0 !w-screen !h-screen !z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-page-fade">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 animate-page-fade text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Apakah Anda yakin ingin keluar dari akun Anda?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  onLogout()
                }}
                className="flex-1 px-4 py-3 bg-[#E74C3C] hover:bg-[#c0392b] text-white text-sm font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
