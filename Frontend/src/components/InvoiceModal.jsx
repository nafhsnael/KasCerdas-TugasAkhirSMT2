import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const getBackendOrigin = () => {
  const baseApiUrl = import.meta.env.VITE_API_URL || 'https://backend-kascerdas-production.up.railway.app'
  return baseApiUrl.replace(/\/api$/, '')
}

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://backend-kascerdas-production.up.railway.app/api'
}

const buildReceiptUrl = (value) => {
  if (!value) return null

  const url = String(value).trim()
  if (!url) return null
  if (/^(https?:|blob:|data:)/i.test(url)) return url

  const cleanPath = url.replace(/^\/+/, '')
  const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`
  const backendOrigin = getBackendOrigin()

  return backendOrigin ? `${backendOrigin}/${storagePath}` : `/${storagePath}`
}

const buildReceiptApiUrl = (transactionId) => {
  if (!transactionId) return null
  return `${getApiBaseUrl()}/transactions/${transactionId}/receipt`
}

function ReceiptPreview({ transactionId, receipt, isImageReceipt, isPdfReceipt, transaction }) {
  const [secureUrl, setSecureUrl] = useState(null)
  const [secureType, setSecureType] = useState('')
  const [secureLoading, setSecureLoading] = useState(false)
  const [urlIndex, setUrlIndex] = useState(0)
  const [hasError, setHasError] = useState(false)

  const urls = useMemo(() => {
    const values = [
      receipt?.fallbackUrl,
      receipt?.localUrl,
      receipt?.url,
      receipt?.preview,
      receipt?.path,
      receipt?.receipt_url,
      receipt?.bukti_nota,
      receipt?.bukti,
      receipt?.name,
      transaction?.bukti_nota,
      transaction?.bukti,
      transaction?.receipt_url,
      transaction?.receiptUrl,
    ]

    const candidates = []
    const backendOrigin = getBackendOrigin()

    values.forEach((value) => {
      if (!value) return
      const raw = String(value).trim()
      if (!raw) return

      if (/^(blob:|data:)/i.test(raw)) {
        candidates.push(raw)
        return
      }

      if (/^https?:/i.test(raw)) {
        if (backendOrigin && raw.startsWith(backendOrigin) && !raw.includes('/storage/')) {
          const pathOnly = raw.replace(backendOrigin, '').replace(/^\/+/, '')
          const storagePath = pathOnly.startsWith('storage/') ? pathOnly : `storage/${pathOnly}`
          candidates.push(`${backendOrigin}/${storagePath}`)
        }
        candidates.push(raw)
        return
      }

      const cleanRaw = raw.replace(/^\/+/, '')
      const storagePath = cleanRaw.startsWith('storage/') ? cleanRaw : `storage/${cleanRaw}`
      if (backendOrigin) candidates.push(`${backendOrigin}/${storagePath}`)
      candidates.push(`/${storagePath}`)
    })

    return [...new Set(candidates.filter(Boolean))]
  }, [receipt, transaction])

  const canFetchSecureReceipt = Boolean(
    transactionId &&
    !String(transactionId).startsWith('t-') &&
    receipt &&
    !String(receipt?.url || '').startsWith('blob:')
  )

  useEffect(() => {
    let objectUrl = null
    const controller = new AbortController()

    setSecureUrl(null)
    setSecureType('')
    setUrlIndex(0)
    setHasError(false)

    if (!canFetchSecureReceipt) {
      setSecureLoading(false)
      return undefined
    }

    const token = localStorage.getItem('token')
    const receiptApiUrl = buildReceiptApiUrl(transactionId)

    setSecureLoading(true)

    fetch(receiptApiUrl, {
      method: 'GET',
      headers: {
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Receipt endpoint failed')
        const blob = await response.blob()
        if (!blob || blob.size === 0) throw new Error('Receipt file empty')
        objectUrl = URL.createObjectURL(blob)
        setSecureType(blob.type || '')
        setSecureUrl(objectUrl)
      })
      .catch(() => {
        setSecureUrl(null)
        setSecureType('')
      })
      .finally(() => {
        if (!controller.signal.aborted) setSecureLoading(false)
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [canFetchSecureReceipt, transactionId, receipt?.url, receipt?.path, receipt?.receipt_url])

  const src = secureUrl || urls[urlIndex]
  const displayAsPdf = isPdfReceipt || secureType === 'application/pdf'
  const displayAsImage = !displayAsPdf && (isImageReceipt || secureType.startsWith('image/'))

  const handleImageError = () => {
    if (urlIndex + 1 < urls.length) {
      setUrlIndex((prev) => prev + 1)
    } else {
      setHasError(true)
    }
  }

  if (secureLoading && !src) {
    return <p className="text-sm text-slate-500">Memuat bukti nota...</p>
  }

  if (hasError || !src) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs text-slate-500 font-medium">Bukti nota tidak dapat dimuat atau tidak valid.</p>
      </div>
    )
  }

  if (displayAsPdf) {
    return (
      <iframe
        src={src}
        title={receipt?.name || 'Bukti Nota PDF'}
        className="h-[420px] w-full rounded-xl border border-slate-200 bg-white"
      />
    )
  }

  if (displayAsImage) {
    return (
      <img
        src={src}
        alt="Bukti Nota"
        onError={handleImageError}
        className="max-h-[420px] w-full rounded-xl border border-slate-200 bg-white object-contain p-2"
      />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <svg
        className="h-8 w-8 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold text-slate-700">{receipt?.name || 'Bukti Nota'}</p>
        <p className="text-xs text-slate-500">File nota berhasil tersimpan.</p>
      </div>
    </div>
  )
}

function InvoiceModal({ isOpen, transaction, onClose, userType }) {
  if (!isOpen || !transaction) return null

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    if (typeof metadata === 'string') {
      try {
        const parsed = JSON.parse(metadata)
        return parsed && typeof parsed === 'object' ? parsed : {}
      } catch (e) {
        return {}
      }
    }
    return typeof metadata === 'object' ? metadata : {}
  }

  const metadata = parseMetadata(transaction.metadata)
  const category = transaction.businessCategory || metadata.businessCategory || metadata.business_category || transaction.category || '-'
  const stockItemName =
    transaction.stockItemName ||
    metadata.stockItemName ||
    metadata.stock_item_name ||
    transaction.stockItemId ||
    metadata.stockItemId ||
    metadata.stock_item_id ||
    transaction.title ||
    '-'
  const stockQtyVal = transaction.stockQty ?? metadata.stockQty ?? metadata.stock_qty ?? null
  const stockQty = (stockQtyVal !== null && stockQtyVal !== undefined && String(stockQtyVal).trim() !== '' && stockQtyVal !== '-') ? `${stockQtyVal} unit` : '1 unit'
  const receiptPath = transaction.receipt_url || transaction.receiptUrl || transaction.bukti_nota || transaction.bukti
  const receiptName = receiptPath ? String(receiptPath).split('/').pop() : 'Bukti Nota'
  const receiptUrl = buildReceiptUrl(receiptPath)
  const receipt = transaction.receipt
    ? {
      ...transaction.receipt,
      fallbackUrl: transaction.receipt.fallbackUrl || transaction.receipt.localUrl,
      url: transaction.receipt.url || transaction.receipt.preview || receiptUrl,
    }
    : (receiptUrl ? {
      name: receiptName,
      type: receiptName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      url: receiptUrl,
    } : null)
  const amount = Number(transaction.amount || 0)
  const isStockTransaction = category === 'Beli Bahan Baku / Stok' || category === 'Hutang Supplier'

  const isUmkmUser = 
    userType === 'umkm' || 
    metadata.is_umkm === true || 
    metadata.is_umkm === 'true' || 
    transaction.user?.usertype === 'umkm'

  const isBeliBahanBakuOrStok = 
    category === 'Beli Bahan Baku / Stok' || 
    category === 'Beli Bahan Baku' || 
    category === 'Beli Stok' || 
    String(category).toLowerCase().includes('beli bahan baku') || 
    String(category).toLowerCase().includes('beli stok')

  const qtyVal = Number(stockQtyVal) || 1
  const unitPrice = Math.round(amount / qtyVal)

  const displayDate = (() => {
    const d = transaction.date
    if (!d) return '-'
    if (typeof d === 'string' && d.includes('T')) return d.slice(0, 10)
    return d
  })()

  const receiptText = `${receipt?.type || ''} ${receipt?.name || ''} ${receipt?.url || ''} ${receiptPath || ''}`
  const isImageReceipt = /image\//i.test(receiptText) || /\.(jpg|jpeg|png|webp|gif)(\?|#|$)/i.test(receiptText)
  const isPdfReceipt = /application\/pdf/i.test(receiptText) || /\.pdf(\?|#|$)/i.test(receiptText)

  return createPortal(
    <div className="!fixed !inset-0 !w-screen !h-screen !z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-lg font-bold text-gray-600">Detail Invoice</h3>
            {transaction.invoice && (
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {transaction.invoice}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-all"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Highlight Jumlah (Total) */}
          <div className="text-center p-6 bg-blue-50/60 rounded-2xl border border-blue-100/50">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block text-center">TOTAL TRANSAKSI</span>
            <h2 className={`text-3xl font-bold mt-2 text-center ${
              String(transaction.type).toLowerCase() === 'expense' ? 'text-red-600' : 'text-emerald-600'
            }`}>
              Rp {amount.toLocaleString('id-ID')}
            </h2>
          </div>

          {/* Informasi Transaksi */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-2">
              INFORMASI TRANSAKSI
            </span>
            
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm text-gray-500">Judul Transaksi</span>
              <span className="text-sm font-semibold text-gray-800 capitalize">{transaction.title}</span>
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm text-gray-500">Kategori</span>
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">
                {category}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm text-gray-500">Tanggal</span>
              <span className="text-sm font-semibold text-gray-800">{displayDate}</span>
            </div>
          </div>

          {/* Detail Stok */}
          {isUmkmUser && isBeliBahanBakuOrStok && (
            <div className="space-y-1 pt-2">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-2">
                DETAIL STOK
              </span>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-sm text-gray-500">Item</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{stockItemName}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-sm text-gray-500">Kuantitas</span>
                <span className="text-sm font-semibold text-gray-800">{stockQty}</span>
              </div>
            </div>
          )}

          {/* Catatan */}
          {transaction.note && (
            <div className="space-y-1 pt-2">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-2">
                Catatan
              </span>
              <p className="rounded-xl bg-slate-50 p-3.5 text-sm text-gray-700 leading-relaxed border border-slate-100">
                {transaction.note}
              </p>
            </div>
          )}

          {/* Bukti Nota */}
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-2">
              BUKTI NOTA
            </span>
            {receipt ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-1">
                <ReceiptPreview
                  transactionId={transaction.id}
                  receipt={receipt}
                  isImageReceipt={isImageReceipt}
                  isPdfReceipt={isPdfReceipt}
                  transaction={transaction}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-slate-500">Bukti nota belum diunggah.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default InvoiceModal
