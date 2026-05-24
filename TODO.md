# TODO - Sinkronisasi Logout/Login Antar-Tab

- [x] Update `src/App.jsx` untuk mendengarkan perubahan `localStorage.token` lewat event `storage`.

- [x] Saat token terhapus/berubah, sinkronkan state: `token`, `isAuthenticated`, `showLanding`, dan redirect ke halaman yang sesuai (`/login` atau `/`).

- [x] Pastikan cleanup listener berjalan.

- [ ] Jalankan aplikasi dan test skenario antar-tab (login/logout di tab berbeda).

