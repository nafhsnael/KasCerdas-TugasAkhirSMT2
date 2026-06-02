import { useState } from 'react'
import CustomModal from '../components/CustomModal'

function UserTypePage({ onNext }) {
  const [selected, setSelected] = useState(null)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
  })

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
      label: 'Masyarakat umum',
      description: 'Untuk pencatatan keuangan rumah tangga dan pengeluaran umum sehari-hari',
    },
  ]

  const handleSubmit = () => {
    if (!selected) {
      setModalConfig({
        isOpen: true,
        title: 'Pemberitahuan',
        message: 'Pilih dulu ya!',
      })
      return
    }

    onNext(selected)
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white shadow-sm hover:shadow-md transition-all duration-300">
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
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
              selected === item.id
                ? 'border-[#38ADA9] bg-[#38ADA9]/5 ring-2 ring-[#38ADA9]/20 scale-[1.02] shadow-md'
                : 'border-slate-200 bg-white hover:border-[#38ADA9]/50 hover:scale-[1.02] shadow-sm'
            }`}
          >
            <h3 className={`text-lg font-bold transition-colors duration-300 ${selected === item.id ? 'text-[#38ADA9]' : 'text-slate-800'}`}>
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
        className="mt-6 w-full rounded-2xl bg-[#38ADA9] py-3.5 font-semibold text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 hover:bg-[#2e8b87]"
      >
        Lanjutkan
      </button>

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default UserTypePage