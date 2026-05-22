import { useMemo, useState, useEffect } from 'react'

function ProfilePage({ userProfile, setUserProfile, onNavigate }) {
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    user: '',
    phone: '',
    address: '',
    usertype: '',
  })
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || '')
  const [imagePreview, setImagePreview] = useState(userProfile?.profileImage || '')

  useEffect(() => {
    if (userProfile) {
      setProfile({
        nama: userProfile.nama || '',
        email: userProfile.email || '',
        user: userProfile.user || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        usertype: userProfile.usertype || '',
      })
      setProfileImage(userProfile.profileImage || '')
      setImagePreview(userProfile.profileImage || '')
    }
  }, [userProfile])

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result
        setProfileImage(imageData)
        setImagePreview(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!profile.nama || !profile.email || !profile.user) {
      alert('Mohon isi field Nama, Email, dan Username')
      return
    }
    setUserProfile((prev) => ({
      ...prev,
      nama: profile.nama,
      email: profile.email,
      user: profile.user,
      phone: profile.phone,
      address: profile.address,
      profileImage: profileImage,
    }))
    alert('Profil berhasil diperbarui!')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white">
        <h2 className="text-2xl font-bold">Profil Pengguna</h2>
        <p className="text-sm text-white/80 mt-2">
          Kelola dan perbarui informasi profil kamu
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative">
          <img
            src={imagePreview}
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover border-4 border-[#F6B93B]"
          />
          <label className="absolute bottom-0 right-0 bg-[#F6B93B] hover:bg-[#D9CFC7] text-white rounded-full p-2 cursor-pointer transition shadow-lg">
            <span className="text-xl">+</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Lengkap *</label>
            <input
              type="text"
              value={profile.nama}
              onChange={(e) => handleChange('nama', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#38ADA9] focus:outline-none focus:ring-[#38ADA9]/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Username *</label>
            <input
              type="text"
              value={profile.user}
              onChange={(e) => handleChange('user', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#38ADA9] focus:outline-none focus:ring-[#38ADA9]/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#38ADA9] focus:outline-none focus:ring-[#38ADA9]/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Telepon</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#38ADA9] focus:outline-none focus:ring-[#38ADA9]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Alamat</label>
          <textarea
            value={profile.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#38ADA9] focus:outline-none focus:ring-[#38ADA9]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Dompet</label>
          <div className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 shadow-sm">
            <p className="text-slate-900 font-medium">{userProfile?.dompet || '-'}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Jenis Profil</label>
          <div className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 shadow-sm">
            <p className="text-slate-900 font-medium">
              {userProfile?.usertype === 'umkm' && 'UMKM'}
              {userProfile?.usertype === 'mahasiswa' && 'Mahasiswa'}
              {userProfile?.usertype === 'masyarakat_umum' && 'Masyarakat Umum'}
              {!userProfile?.usertype && '-'}
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Jenis profil tidak dapat diubah setelah pendaftaran.
          </p>
        </div>


        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-[#38ADA9] py-3 font-semibold text-white transition hover:bg-[#2e8b87]"
          >
            Simpan Perubahan
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('transactions')}
            className="flex-1 rounded-2xl bg-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage