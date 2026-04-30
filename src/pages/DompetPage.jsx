import { useState } from 'react'

function DompetPage({ onNext }) {
  const [selected, setSelected] = useState(null)

  const options = [
    {
      id: 'Usaha',
      label: 'Usaha',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'Pribadi',
      label: 'Pribadi',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    }
  ]

  const handleSubmit = () => {
    if (!selected) {
      alert('Pilih dompet dulu ya!')
      return
    }

    onNext(selected)
  }

  return (
  <div className="mx-auto max-w-xl">
    {/* Header */}
    <div className="mb-6 rounded-t-3xl bg-[#38ADA9] p-6 text-center text-white">
      <h2 className="text-xl font-bold">Pilih User</h2>
    </div>

    {/* Container */}
    <div className="rounded-b-3xl bg-white p-6 shadow">
      
      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {options.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`w-32 cursor-pointer rounded-2xl p-5 text-center transition-all ${
              selected === item.id
                ? "bg-[#38ADA9]/20 ring-2 ring-[#38ADA9] scale-105"
                : "bg-gray-100 hover:scale-105"
            }`}
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.label}
              className="mx-auto mb-3 h-24 object-contain"
            />

            {/* Label */}
            <p className="text-sm font-semibold text-gray-700">
              {item.label}
            </p>
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
  </div>
);
}

export default DompetPage