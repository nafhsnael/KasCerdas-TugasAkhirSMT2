import { useState } from 'react'
import CustomModal from '../components/CustomModal'

function DompetPage({ onNext }) {
  const [selected, setSelected] = useState(null)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
  })

  const options = [
    {
      id: 'Usaha',
      label: 'Dompet Usaha',
      description: 'Digunakan khusus untuk mengelola modal, pemasukan, dan pengeluaran bisnis/usaha',
    },
    {
      id: 'Pribadi',
      label: 'Dompet Pribadi',
      description: 'Digunakan untuk mengatur keuangan belanja bulanan, tabungan, dan kebutuhan pribadi',
    }
  ]

  const handleSubmit = () => {
    if (!selected) {
      setModalConfig({
        isOpen: true,
        title: 'Pemberitahuan',
        message: 'Pilih dompet dulu ya!',
      })
      return
    }

    onNext(selected)
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold">Pilih Jenis Dompet</h2>
        <p className="text-sm text-white/80">
          Tentukan penggunaan dompet utama kamu
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
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-2xl bg-[#38ADA9] py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#2e8b87] hover:scale-105 active:scale-95 transform"
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

export default DompetPage