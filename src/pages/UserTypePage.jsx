import { useState } from 'react'

function UserTypePage({ onNext }) {
  const [selected, setSelected] = useState(null)

  const options = [
    {
      id: 'umkm',
      label: 'UMKM',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'masyarakat',
      label: 'Masyarakat Lain',
      image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=400&q=80',
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
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white">
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
            className={`cursor-pointer overflow-hidden rounded-2xl border transition-all ${
              selected === item.id
                ? 'border-[#38ADA9] ring-2 ring-[#38ADA9]/30 scale-[1.02]'
                : 'border-slate-200 hover:scale-[1.01]'
            }`}
          >
            <div className="relative h-40">
              <img
                src={item.image}
                alt={item.label}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-lg font-semibold text-white">
                  {item.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-2xl bg-[#38ADA9] py-3 font-semibold text-white transition hover:bg-[#2e8b87]"
      >
        Lanjutkan
      </button>
    </div>
  )
}

export default UserTypePage