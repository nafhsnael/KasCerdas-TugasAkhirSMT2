import { useState } from 'react'

function Sidebar({ currentPage, onNavigate, userProfile, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

const menuItems = [
    { id: 'dashboard', label: 'Dashboard'},
    { id: 'users', label: 'Users'},
    { id: 'reports', label: 'Reports' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'database', label: 'Database' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <div className={`fixed left-0 top-0 flex flex-col transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#38ADA9] to-[#2e8b87] text-white h-screen shadow-lg z-10`}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center">
              <img
                src="/logo.png"
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Logout</h3>
            <p className="text-gray-600 mb-6">Beneran logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  onLogout()
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
