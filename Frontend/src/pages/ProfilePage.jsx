import { useMemo, useState, useEffect } from 'react'
import CustomModal from '../components/CustomModal'

function ProfilePage({ userProfile, setUserProfile, onNavigate }) {
  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    usertype: '',
  })
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || '');
  const [imagePreview, setImagePreview] = useState(userProfile?.profileImage || '');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = (message, title = 'Pemberitahuan') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'info',
    })
  }

  const jenisProfilValue = useMemo(() => {
    const type = profile.usertype || userProfile?.usertype || '';
    if (type === 'umkm') return 'UMKM';
    if (type === 'mahasiswa') return 'Mahasiswa';
    if (type === 'masyarakat_umum') return 'Masyarakat Umum';
    return '-';
  }, [profile.usertype, userProfile?.usertype]);

  // Fetch user profile from backend on mount
  useEffect(() => {
    const token = window.localStorage.getItem('token');
    fetch(`${backendUrl}/api/user/profil`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const data = json.data;
          setProfile({
            nama: data.name || '',
            email: data.email || '',
            username: data.username || '',
            phone: data.phone || '',
            address: data.address || '',
            usertype: data.user_type || '',
          });
          setProfileImage(data.profileImage || '');
          setImagePreview(data.profileImage || '');
          if (setUserProfile) {
            setUserProfile((prev) => ({
              ...prev,
              nama: data.name || prev.nama,
              user: data.username || prev.user,
              email: data.email || prev.email,
              usertype: data.user_type || prev.usertype,
              profileImage: data.profileImage || prev.profileImage,
            }));
          }
        }
      })
      .catch((e) => console.error('Failed to load profile', e));
  }, []);




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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile.nama || !profile.email || !profile.username) {
      showAlert('Mohon isi field Nama, Email, dan Username', 'Validasi Gagal');
      return;
    }
    const token = window.localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/profil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: profile.nama,
          email: profile.email,
          username: profile.username,
          phone: profile.phone,
          address: profile.address,
          avatar: profileImage,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        if (setUserProfile) {
          const updatedUser = json.data || {};
          setUserProfile((prev) => ({
            ...prev,
            nama: updatedUser.name || prev.nama,
            user: updatedUser.username || prev.user,
            email: updatedUser.email || prev.email,
            usertype: updatedUser.user_type || prev.usertype,
            profileImage: updatedUser.profileImage || profileImage || prev.profileImage,
          }));
          if (updatedUser.profileImage) {
            setProfileImage(updatedUser.profileImage);
            setImagePreview(updatedUser.profileImage);
          }
        }
        showAlert('Profil berhasil diperbarui!', 'Berhasil');
      } else {
        // Parse error response safely, fallback to raw text
        let errorMsg = `Gagal memperbarui profil (status ${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.message) errorMsg = errJson.message;
          if (errJson.errors) errorMsg = Object.values(errJson.errors).flat().join('\n');
          if (errJson.error_detail) errorMsg = errJson.error_detail;
        } catch (_) {
          const errText = await response.text();
          if (errText) errorMsg = errText;
        }
        showAlert(errorMsg, 'Gagal');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Terjadi kesalahan saat menyimpan', 'Kesalahan');
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative mt-16 mb-8 animate-fade-in-up">

      {/* Avatar/Foto Profil Absolut */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white bg-gray-100 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-md flex items-center justify-center text-gray-400 font-semibold">
              Avatar
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-[#F6B93B] hover:bg-[#e0a82b] text-white rounded-full p-1.5 cursor-pointer transition shadow-md flex items-center justify-center w-7 h-7">
            <span className="text-sm font-bold leading-none">+</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Info Ringkas Profile */}
      <div className="text-center mt-12 mb-6">
        <h3 className="text-lg font-bold text-gray-800">{profile.nama || 'Profil Pengguna'}</h3>
        <p className="text-xs text-gray-400 mt-1">Kelola dan perbarui informasi profil kamu</p>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Baris 1: Nama Lengkap & Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Nama Lengkap *</label>
            <input
              type="text"
              value={profile.nama}
              onChange={(e) => handleChange('nama', e.target.value)}
              required
              className="h-11 px-4 border border-gray-200/80 bg-gray-50/60 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Username *</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => handleChange('username', e.target.value)}
              required
              className="h-11 px-4 border border-gray-200/80 bg-gray-50/60 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Masukkan username"
            />
          </div>

          {/* Baris 2: Email & Telepon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Email *</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="h-11 px-4 border border-gray-200/80 bg-gray-50/60 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Contoh: user@email.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Telepon</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-11 px-4 border border-gray-200/80 bg-gray-50/60 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Contoh: 08123456789"
            />
          </div>

          {/* Alamat */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700">Alamat</label>
            <textarea
              value={profile.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows="3"
              className="p-4 border border-gray-200/80 bg-gray-50/60 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 transition-all duration-200 text-gray-700 placeholder-gray-400 min-h-[100px]"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          {/* Jenis Profil (Kunci Kolom) */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700">Jenis Profil</label>
            <input
              type="text"
              value={jenisProfilValue}
              disabled
              className="h-11 px-4 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-sm cursor-not-allowed select-none font-medium"
            />
            <span className="text-[11px] text-gray-400 mt-0.5">* Jenis profil tidak dapat diubah setelah pendaftaran.</span>
          </div>
        </div>

        {/* Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#38ADA9] hover:bg-[#2c8a7d] py-3 font-semibold text-white shadow-sm shadow-[#38ADA9]/10 hover:shadow-md hover:shadow-[#38ADA9]/20 transition-all duration-300 hover:scale-105 active:scale-95 transform text-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default ProfilePage