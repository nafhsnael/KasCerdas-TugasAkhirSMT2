import { useState } from 'react'

function Sidebar({ currentPage, onNavigate, userProfile, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { id: 'transactions', label: 'Transaksi' },
    { id: 'profile', label: 'Profil' },
  ]

  return (
    <div className={`flex flex-col transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#38ADA9] to-[#2e8b87] text-white min-h-screen shadow-lg`}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {isExpanded && <h1 className="text-xl font-bold">Dompet</h1>}
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
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white/80 hover:bg-white/10 transition ${
            !isExpanded && 'justify-center'
          }`}
        >
          <span className="text-xl">🚪</span>
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
