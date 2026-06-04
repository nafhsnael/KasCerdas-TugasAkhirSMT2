import { useState } from 'react'
import logoImg from '../image/logo.jpg'

export default function LandingPage({ onLoginClick, onRegisterClick }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const features = [
    {
      icon: (
        <svg className="w-10 h-10 text-teal-600 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Kelola Keuangan',
      description: 'Pencatatan seluruh transaksi keuangan secara terorganisasi, sistematis, dan praktis.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-teal-600 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analisis Mendalam',
      description: 'Visualisasi analisis laporan pengeluaran serta pemasukan secara komprehensif demi mendukung keputusan finansial Anda.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-teal-600 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      title: 'Budgeting Cerdas',
      description: 'Perencanaan anggaran per kategori secara disiplin guna mengontrol pengeluaran secara waktu nyata (real-time).',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-teal-600 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Akses Mudah',
      description: 'Pengelolaan keuangan secara fleksibel kapan saja dan di mana saja melalui platform web yang responsif.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="mt-6 max-w-6xl mx-auto w-full animate-page-fade">
          {/* Navbar */}
          <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="KasCerdas" className="h-8 w-8" />
              <span className="text-xl font-bold text-teal-600">KasCerdas</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="hidden md:flex gap-4 items-center">
              <button
                onClick={onLoginClick}
                className="px-6 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition"
              >
                Masuk
              </button>
              <button
                onClick={onRegisterClick}
                className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Daftar Gratis
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isExpanded && (
            <div className="md:hidden pb-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  onLoginClick()
                  setIsExpanded(false)
                }}
                className="w-full px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition text-left"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  onRegisterClick()
                  setIsExpanded(false)
                }}
                className="w-full px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Daftar Gratis
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-fade-in-up">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
            Kelola Keuangan Anda dengan <span className="text-teal-600">Lebih Cerdas</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            KasCerdas adalah aplikasi manajemen keuangan pintar yang dirancang untuk membantu Anda, pelajar, UMKM, dan masyarakat umum mengelola keuangan dengan lebih efisien.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={onLoginClick}
              className="px-8 py-4 bg-teal-600 text-white font-semibold rounded-2xl hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-teal-600/20"
            >
              Masuk ke Akun
            </button>
            <button
              onClick={onRegisterClick}
              className="px-8 py-4 bg-white text-teal-600 font-semibold rounded-2xl border-2 border-teal-600 hover:bg-teal-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
            >
              Buat Akun Baru
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Fitur Unggulan</h2>
            <p className="text-slate-500 mt-4 leading-relaxed">Rasakan kemudahan mengontrol keuangan Anda dengan alat yang dirancang khusus untuk berbagai kebutuhan.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-[28px] border border-slate-200 hover:border-teal-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-slate-50/50"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight leading-snug">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-24 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Untuk Siapa KasCerdas?
            </h2>
            <p className="text-slate-500 mt-4 leading-relaxed">Dirancang khusus dengan fitur spesifik untuk kebutuhan finansial yang beragam.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 border-t-4 border-t-teal-600">
              <div className="mb-6 p-3 bg-teal-50 w-fit rounded-2xl">
                <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mahasiswa</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Kelola uang saku, pantau pengeluaran, dan pelajari pengelolaan keuangan pribadi dengan baik.
              </p>
            </div>

            <div className="p-8 bg-white rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 border-t-4 border-t-teal-600">
              <div className="mb-6 p-3 bg-teal-50 w-fit rounded-2xl">
                <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">UMKM</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pantau arus kas bisnis, kelola inventory, piutang, dan analisis performa penjualan Anda.
              </p>
            </div>

            <div className="p-8 bg-white rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 border-t-4 border-t-teal-600">
              <div className="mb-6 p-3 bg-teal-50 w-fit rounded-2xl">
                <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Masyarakat Umum</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Catat pengeluaran, buat budget keluarga, dan rencanakan masa depan keuangan yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-full m-0 p-0 bg-gradient-to-r from-teal-600 to-teal-700 py-20 shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Mulai Kelola Keuangan Anda Sekarang</h2>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Gratis, aman, dan mudah digunakan. Daftar dalam hitungan detik.
          </p>
          <button
            onClick={onRegisterClick}
            className="px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:bg-teal-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-black/10"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-full m-0 p-0 bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2026 KasCerdas. Semua hak dilindungi. Kelola keuangan dengan lebih cerdas.
          </p>
        </div>
      </footer>
    </div>
  )
}
