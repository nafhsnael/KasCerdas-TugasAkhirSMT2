import React from 'react'

function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900 p-4">
      <div className="w-full max-w-lg rounded-[36px] bg-white/80 backdrop-blur-md p-10 shadow-2xl shadow-slate-200/50 border border-white text-center relative overflow-hidden animate-fade-in-up">
        {/* Decorative background blur shapes */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-teal-200/40 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#F6B93B]/20 rounded-full blur-2xl"></div>

        {/* Animated illustration area */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center mb-8">
          {/* Main big gear */}
          <div className="absolute text-teal-600 animate-spin" style={{ animationDuration: '8s' }}>
            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>

          {/* Small gear */}
          <div className="absolute text-teal-500 animate-spin -top-2 -right-2" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            </svg>
          </div>

          {/* Decorative pulse ring */}
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* Text information */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Sistem Sedang Pemeliharaan
        </h1>
        <div className="w-16 h-1 bg-[#38ADA9] mx-auto rounded-full mb-6"></div>
        <p className="text-slate-600 mb-8 leading-relaxed font-medium">
          Kami sedang melakukan pemeliharaan rutin dan peningkatan server untuk memberikan pelayanan keuangan terbaik bagi Anda. Layanan akan kembali online dalam waktu dekat.
        </p>

        {/* Alert note box */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-4 text-left flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-amber-800">Catatan Penting</p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-normal">
              Akses panel admin tetap berjalan secara normal bagi pengurus sistem. Silakan hubungi Administrator jika terjadi masalah mendesak.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
