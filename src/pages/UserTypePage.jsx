import { useState } from 'react'

function UserTypePage({ onNext }) {
  const [selected, setSelected] = useState(null)

  const options = [
    {
      id: 'umkm',
      label: 'UMKM',
      description: 'Untuk pemisahan akun usaha dan pribadi serta pencatatan arus kas usaha.',
    },
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      description: 'Untuk pencatatan keuangan pribadi, kos, kuliah, dan kebutuhan sehari-hari',
    },
    {
      id: 'masyarakat_umum',
      label: 'Masyarakat Lain',
      description: 'Untuk pencatatan keuangan rumah tangga dan pengeluaran umum sehari-hari',
    },
  ]

  const handleSubmit = () => {
    if (!selected) {
      alert('Pilih dulu ya!')
      return
    }

    onNext(selected)
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white shadow-md">
        <h2 className="text-xl font-bold">Pilih Jenis Pengguna</h2>
        <p className="text-sm text-white/80">
          Supaya pengalaman kamu lebih sesuai
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {options.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
              selected === item.id
                ? 'border-[#38ADA9] bg-[#38ADA9]/5 ring-2 ring-[#38ADA9]/20 scale-[1.02]'
                : 'border-slate-200 bg-white hover:border-[#38ADA9]/50 hover:scale-[1.01]'
            }`}
          >
            <h3 className={`text-lg font-bold ${selected === item.id ? 'text-[#38ADA9]' : 'text-slate-800'}`}>
              {item.label}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {item.description}
            </p>
            {item.features && (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 text-[#38ADA9]">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-2xl bg-[#38ADA9] py-3.5 font-semibold text-white shadow-md transition hover:bg-[#2e8b87]"
      >
        Lanjutkan
      </button>
    </div>
  )
}

export default UserTypePage