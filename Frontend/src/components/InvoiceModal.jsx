import { useEffect, useMemo, useState } from 'react'

const getBackendOrigin = () => {
  const envBackendUrl = import.meta.env?.VITE_BACKEND_URL || ''
  const envApiUrl = import.meta.env?.VITE_API_URL || ''
  const apiOrigin = envApiUrl ? envApiUrl.replace(/\/api\/?$/, '') : ''

  if (envBackendUrl) return envBackendUrl.replace(/\/$/, '')
  if (apiOrigin) return apiOrigin.replace(/\/$/, '')

  if (typeof window !== 'undefined' && /^517\d$/.test(window.location.port)) {
    return 'http://localhost:8000'
  }

  return ''
}

const getApiBaseUrl = () => {
  const envApiUrl = import.meta.env?.VITE_API_URL || ''
  if (envApiUrl) return envApiUrl.replace(/\/$/, '')
  return '/api'
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

function ReceiptPreview({ transactionId, receipt, isImageReceipt, isPdfReceipt }) {
  const [secureUrl, setSecureUrl] = useState(null)
  const [secureType, setSecureType] = useState('')
  const [secureLoading, setSecureLoading] = useState(false)
  const [urlIndex, setUrlIndex] = useState(0)

  const urls = useMemo(() => {
    const values = [
      receipt?.fallbackUrl,
      receipt?.localUrl,
      receipt?.url,
      receipt?.preview,
      receipt?.path,
      receipt?.receipt_url,
      receipt?.name,
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
        candidates.push(raw)
        return
      }

      const cleanRaw = raw.replace(/^\/+/, '')
      const storagePath = cleanRaw.startsWith('storage/') ? cleanRaw : `storage/${cleanRaw}`
      candidates.push(`/${storagePath}`)
      if (backendOrigin) candidates.push(`${backendOrigin}/${storagePath}`)
    })

    return [...new Set(candidates.filter(Boolean))]
  }, [receipt])

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

  if (secureLoading && !src) {
    return <p className="text-sm text-slate-500">Memuat bukti nota...</p>
  }

  if (!src) {
    return <p className="text-sm text-slate-500">Bukti nota belum tersedia.</p>
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
        onError={() => setUrlIndex((index) => (index + 1 < urls.length ? index + 1 : index))}
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

function InvoiceModal({ isOpen, transaction, onClose }) {
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
    '-'
  const stockQty = transaction.stockQty ?? metadata.stockQty ?? metadata.stock_qty ?? '-'
  const receiptPath = transaction.receipt_url || transaction.receiptUrl
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

  const displayDate = (() => {
    const d = transaction.date
    if (!d) return '-'
    if (typeof d === 'string' && d.includes('T')) return d.slice(0, 10)
    return d
  })()

  const receiptText = `${receipt?.type || ''} ${receipt?.name || ''} ${receipt?.url || ''} ${receiptPath || ''}`
  const isImageReceipt = /image\//i.test(receiptText) || /\.(jpg|jpeg|png)(\?|#|$)/i.test(receiptText)
  const isPdfReceipt = /application\/pdf/i.test(receiptText) || /\.pdf(\?|#|$)/i.test(receiptText)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Detail Invoice</h2>
            <p className="text-sm text-slate-500">{transaction.invoice}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition"
          >
            <svg
              className="h-6 w-6"
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

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Informasi Transaksi */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
              Informasi Transaksi
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Judul</p>
                <p className="text-sm font-semibold text-slate-900">{transaction.title}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Kategori</p>
                <p className="text-sm font-semibold text-slate-900">{category}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Tanggal</p>
                <p className="text-sm font-semibold text-slate-900">{displayDate}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Jumlah</p>
                <p className="text-sm font-semibold text-slate-900">
                  Rp {amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {transaction.note && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Catatan
              </h3>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                {transaction.note}
              </p>
            </div>
          )}

          {/* Detail Stok */}
          {isStockTransaction && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Detail Stok
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Item</p>
                  <p className="text-sm font-semibold text-slate-900">{stockItemName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Kuantitas</p>
                  <p className="text-sm font-semibold text-slate-900">{stockQty}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bukti Nota */}
          {receipt && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Bukti Nota
              </h3>
              <div className="rounded-2xl bg-slate-50 p-4">
                <ReceiptPreview
                  transactionId={transaction.id}
                  receipt={receipt}
                  isImageReceipt={isImageReceipt}
                  isPdfReceipt={isPdfReceipt}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal
