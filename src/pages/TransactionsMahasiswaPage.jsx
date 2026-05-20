import TransactionsPage from './TransactionsPage'

function TransactionsMahasiswaPage(props) {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mahasiswa</p>
        <h2 className="text-xl font-semibold text-slate-900">Transaksi Mahasiswa</h2>
        <p className="mt-2 text-sm text-slate-500">
          Kelola pengeluaran kos, tagihan, dan pemasukan studi dengan tampilan sederhana.
        </p>
      </section>
      <TransactionsPage
        {...props}
        defaultWallet="Mahasiswa"
        categories={[
          // Pemasukan
          'Uang Saku/Kiriman',
          'Beasiswa',
          'Penghasilan Kerja Paruh Waktu',
          // Pengeluaran
          'UKT',
          'Buku/Alat Tulis',
          'Makan',
          'Kos',
          'Transportasi',
        ]}
      />
    </div>
  )
}

export default TransactionsMahasiswaPage
