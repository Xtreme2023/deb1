import React, { useState } from 'react'
import {
  PackagePlus,
  X,
  MapPin,
  User,
  QrCode
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function CreateShipmentModal({ isOpen, onClose, onCreated, currentUser }) {
  const [remitente, setRemitente] = useState(
    currentUser?.empresa || [currentUser?.nombre, currentUser?.apellido].filter(Boolean).join(' ') || ''
  )
  const [destinatario, setDestinatario] = useState('')
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('')
  const [origen, setOrigen] = useState('Cochabamba - Sede Principal')
  const [destino, setDestino] = useState('')
  const [direccionDestino, setDireccionDestino] = useState('')
  const [tipoServicio, setTipoServicio] = useState('Flash Express 24h')
  const [piezas, setPiezas] = useState(1)
  const [peso, setPeso] = useState('2.5')
  const [observaciones, setObservaciones] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!remitente.trim() || !destinatario.trim() || !destino.trim()) {
      setErrorMsg('Por favor completa los campos obligatorios (Remitente, Destinatario y Destino).')
      return
    }

    setSaving(true)
    setErrorMsg(null)

    // Generar número de guía único institucional
    const randomDigits = Math.floor(10000 + Math.random() * 90000)
    const suffix =
      tipoServicio.includes('Express')
        ? 'EXP'
        : tipoServicio.includes('Aéreo')
        ? 'AIR'
        : 'STD'
    const numeroGuia = `FS-${randomDigits}-${suffix}`
    const nuevoId = 'env-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)

    const nuevoEnvio = {
      id: nuevoId,
      numeroGuia,
      remitente: remitente.trim(),
      remitenteEmail: currentUser?.email || '',
      destinatario: destinatario.trim(),
      telefono_destinatario: telefonoDestinatario.trim(),
      tipoServicio,
      origen: origen.trim(),
      destino: destino.trim(),
      direccion_destino: direccionDestino.trim() || destino.trim(),
      estado: 'en_almacen', // Comienza en almacén listo para despacho
      piezas: parseInt(piezas) || 1,
      peso: `${peso} kg`,
      peso_total: parseFloat(peso) || 2.5,
      observaciones: observaciones.trim() || 'Despacho prioritario Flash Services',
      fecha_envio: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    try {
      // Intentar persistir en Supabase si está disponible
      if (supabase) {
        // En segundo plano intentamos insertar en la tabla envio
        supabase
          .from('envio')
          .insert([
            {
              numero_guia: numeroGuia,
              origen: nuevoEnvio.origen,
              destino: nuevoEnvio.destino,
              direccion_destino: nuevoEnvio.direccion_destino,
              estado: 'pendiente',
              peso_total: parseFloat(peso) || 1,
              observaciones: nuevoEnvio.observaciones,
            },
          ])
          .then(({ error }) => {
            if (error) console.warn('Supabase DB notice:', error.message)
          })
          .catch(() => {})
      }
    } catch {
      // No bloqueante
    }

    setSaving(false)
    if (onCreated) {
      onCreated(nuevoEnvio)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white">
                Crear Nueva Guía de Envío
              </h3>
              <p className="text-xs text-slate-300">
                Generará automáticamente el número de seguimiento y el código QR oficial
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Grid: Remitente y Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Remitente */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Datos del Remitente
              </span>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Nombre o Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={remitente}
                  onChange={(e) => setRemitente(e.target.value)}
                  placeholder="Ej. Corporación Textil S.A.C."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Ciudad / Origen
                </label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej. Cochabamba Central"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                />
              </div>
            </div>

            {/* Destinatario */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Datos del Destinatario
              </span>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Nombre o Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder="Ej. Dr. Andrés Valencia"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Ciudad / Destino *
                  </label>
                  <input
                    type="text"
                    required
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ej. Cochabamba Norte"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Teléfono Receptor
                  </label>
                  <input
                    type="text"
                    value={telefonoDestinatario}
                    onChange={(e) => setTelefonoDestinatario(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dirección Completa */}
          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1">
              Dirección Específica de Entrega
            </label>
            <input
              type="text"
              value={direccionDestino}
              onChange={(e) => setDireccionDestino(e.target.value)}
              placeholder="Ej. Av. América 2450, Of. 802, Cochabamba"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          {/* Fila: Modalidad, Piezas, Peso */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Modalidad de Envío
              </label>
              <select
                value={tipoServicio}
                onChange={(e) => setTipoServicio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-medium"
              >
                <option value="Flash Express 24h">⚡ Flash Express 24h</option>
                <option value="Courier Terrestre">🚛 Courier Terrestre Estándar</option>
                <option value="Flash Cargo Aéreo">✈️ Flash Cargo Aéreo</option>
                <option value="Same Day Delivery">🛵 Same Day (Mismo Día)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Número de Piezas / Bultos
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={piezas}
                onChange={(e) => setPiezas(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Peso Total Estimado (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1">
              Contenido & Observaciones de Despacho
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Documentación legal sellada, no doblar / Frágil"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2.5 text-xs text-indigo-900">
            <QrCode className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span>
              Al crear la guía se abrirá inmediatamente la pantalla con el <strong>Código QR</strong> listo para descargar en imagen o imprimir como rótulo de bulto.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-md shadow-slate-900/10 flex items-center gap-2"
            >
              {saving ? 'Creando Guía...' : 'Crear Guía y Generar QR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
