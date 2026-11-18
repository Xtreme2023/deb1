import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck
} from 'lucide-react'

export default function TrackingQrModal({ envio, isOpen, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    if (!isOpen || !envio) return

    const generateQr = async () => {
      try {
        setGenerating(true)
        // Datos del código QR: URL de seguimiento público + payload JSON para escáneres de almacén
        const trackingPayload = JSON.stringify({
          app: 'Flash Services Courier Cargo',
          guia: envio.numeroGuia || envio.numero_guia,
          remitente: envio.remitente?.razon_social || envio.remitente?.nombres || envio.remitente,
          destinatario: envio.destinatario?.razon_social || envio.destinatario?.nombres || envio.destinatario,
          origen: envio.origen,
          destino: envio.destino,
          servicio: envio.tipoServicio || envio.tipo_servicio?.nombre || 'Flash Express',
          estado: envio.estado,
          t: Date.now(),
        })

        const url = await QRCode.toDataURL(trackingPayload, {
          width: 380,
          margin: 2,
          color: {
            dark: '#0f172a', // Navy elegante
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H', // Alta corrección para paquetes en movimiento
        })
        setQrDataUrl(url)
      } catch (err) {
        console.error('Error generando QR:', err)
      } finally {
        setGenerating(false)
      }
    }

    generateQr()
  }, [isOpen, envio])

  if (!isOpen || !envio) return null

  const guiaNumero = envio.numeroGuia || envio.numero_guia || 'GUIA-TEMP'
  const remitenteNombre =
    typeof envio.remitente === 'object'
      ? envio.remitente?.razon_social || `${envio.remitente?.nombres || ''} ${envio.remitente?.apellidos || ''}`.trim()
      : envio.remitente
  const destinatarioNombre =
    typeof envio.destinatario === 'object'
      ? envio.destinatario?.razon_social || `${envio.destinatario?.nombres || ''} ${envio.destinatario?.apellidos || ''}`.trim()
      : envio.destinatario
  const servicioNombre =
    typeof envio.tipoServicio === 'object'
      ? envio.tipoServicio?.nombre
      : envio.tipoServicio || envio.tipo_servicio?.nombre || 'Flash Express 24h'
  const estadoFormateado = (envio.estado || 'pendiente').replace('_', ' ')

  // Descargar archivo PNG del código QR
  const handleDownloadQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `QR_Seguimiento_${guiaNumero}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copiar enlace de seguimiento
  const handleCopyLink = () => {
    const url = `${window.location.origin}?guia=${guiaNumero}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Imprimir rótulo de guía
  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rótulo de Envío - ${guiaNumero}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
            .ticket { max-width: 420px; margin: 0 auto; border: 2px dashed #0f172a; border-radius: 12px; padding: 24px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
            .brand { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
            .badge { background: #0f172a; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .guia-box { text-align: center; margin: 16px 0; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; }
            .guia-box h2 { margin: 0; font-size: 22px; font-family: monospace; letter-spacing: 2px; }
            .qr-center { text-align: center; margin: 16px 0; }
            .qr-center img { width: 190px; height: 190px; }
            .field-row { margin-bottom: 10px; font-size: 12px; }
            .field-label { color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px; }
            .field-value { font-size: 13px; font-weight: 600; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .footer-note { font-size: 10px; text-align: center; color: #64748b; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div>
                <div class="brand">FLASH SERVICES</div>
                <div style="font-size: 10px; color: #64748b;">COURIER CARGO &bull; LOGÍSTICA EXPRESS</div>
              </div>
              <div class="badge">${servicioNombre.toUpperCase()}</div>
            </div>

            <div class="guia-box">
              <div style="font-size: 11px; color: #64748b; font-weight: bold;">NÚMERO DE GUÍA DE SEGUIMIENTO</div>
              <h2>${guiaNumero}</h2>
            </div>

            <div class="qr-center">
              <img src="${qrDataUrl}" alt="QR Guía" />
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Escanea para consultar trazabilidad en vivo</div>
            </div>

            <div class="grid-2">
              <div class="field-row">
                <div class="field-label">Origen</div>
                <div class="field-value">${envio.origen}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Destino</div>
                <div class="field-value">${envio.destino}</div>
              </div>
            </div>

            <div class="field-row">
              <div class="field-label">Remitente</div>
              <div class="field-value">${remitenteNombre || 'Cliente Remitente'}</div>
            </div>

            <div class="field-row">
              <div class="field-label">Destinatario</div>
              <div class="field-value">${destinatarioNombre || 'Cliente Receptor'}</div>
            </div>

            <div class="field-row">
              <div class="field-label">Dirección de Entrega</div>
              <div class="field-value">${envio.direccion_destino || envio.destino}</div>
            </div>

            <div class="grid-2">
              <div class="field-row">
                <div class="field-label">Bultos / Piezas</div>
                <div class="field-value">${envio.piezas || 1} pieza(s)</div>
              </div>
              <div class="field-row">
                <div class="field-label">Peso</div>
                <div class="field-value">${envio.peso || envio.peso_total || '1.0'} kg</div>
              </div>
            </div>

            <div class="footer-note">
              Flash Services Courier Cargo &bull; Certificado con Supabase BaaS &bull; www.flashservices.pe
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-xl w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Código QR de Seguimiento
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                  OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Guía certificada para trazabilidad y despacho
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Guide Badge Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Número de Guía
              </span>
              <span className="text-lg font-black font-mono tracking-wider text-slate-900">
                {guiaNumero}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  envio.estado === 'entregado'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : envio.estado === 'en_reparto'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                ● {estadoFormateado}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {servicioNombre}
              </span>
            </div>
          </div>

          {/* QR Display Container */}
          <div className="flex flex-col md:flex-row items-center gap-6 justify-center bg-gradient-to-b from-slate-50 to-white p-5 rounded-2xl border border-slate-200">
            {/* Visual QR Image */}
            <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center group">
              {generating ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generando QR...
                </div>
              ) : (
                <img
                  src={qrDataUrl}
                  alt={`QR ${guiaNumero}`}
                  className="w-48 h-48 object-contain transition-transform group-hover:scale-102"
                />
              )}
            </div>

            {/* Quick Summary */}
            <div className="space-y-3 text-xs w-full max-w-xs">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Remitente
                </span>
                <span className="text-slate-800 font-semibold truncate block">
                  {remitenteNombre || 'Sin remitente'}
                </span>
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Destinatario
                </span>
                <span className="text-slate-800 font-semibold truncate block">
                  {destinatarioNombre || 'Sin destinatario'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Origen</span>
                  <span className="text-slate-800 font-medium">{envio.origen}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Destino</span>
                  <span className="text-slate-800 font-medium">{envio.destino}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Compatible con lectores láser y cámaras móviles</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Descargar QR */}
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-md shadow-slate-900/10"
            >
              <Download className="w-4 h-4" />
              Descargar QR (PNG)
            </button>

            {/* Imprimir Rótulo */}
            <button
              onClick={handlePrintLabel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              Imprimir Rótulo
            </button>

            {/* Copiar Enlace */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Enlace
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between">
          <span>Flash Services Courier Cargo &bull; Sistema Serverless BaaS</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
