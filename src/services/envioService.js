import { supabase } from '../lib/supabaseClient'

const TABLE = 'envio'

/**
 * Servicio central para Envíos / Guías de Transporte (Flash Services Courier Cargo).
 * Reemplaza el modelo Eloquent Envio y centraliza el ciclo de vida del paquete.
 */
export const envioService = {
  /**
   * Obtiene todos los envíos con filtros y paginación.
   */
  async getAll({
    estado,
    remitenteId,
    destinatarioId,
    search = '',
    limit = 50,
    offset = 0,
  } = {}) {
    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        remitente:remitente_id(id, nombres, apellidos, razon_social, numero_documento, telefono, ciudad),
        destinatario:destinatario_id(id, nombres, apellidos, razon_social, numero_documento, telefono, ciudad),
        tipo_servicio:tipo_servicio_id(id, codigo, nombre)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (estado) query = query.eq('estado', estado)
    if (remitenteId) query = query.eq('remitente_id', remitenteId)
    if (destinatarioId) query = query.eq('destinatario_id', destinatarioId)
    if (search) {
      query = query.or(
        `numero_guia.ilike.%${search}%,origen.ilike.%${search}%,destino.ilike.%${search}%,direccion_destino.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  /**
   * Obtiene un envío por su ID con todo el árbol de relaciones (sustituye with() de Eloquent).
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        remitente:remitente_id(*),
        destinatario:destinatario_id(*),
        tipo_servicio:tipo_servicio_id(*),
        piezas:detalle_pieza(*),
        prueba_entrega(*),
        cobros:detalle_cobro_envio(*),
        historial:historial_modificacion(*)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Rastreo público o interno por número de guía.
   */
  async getByNumeroGuia(numeroGuia) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        id,
        numero_guia,
        estado,
        origen,
        destino,
        direccion_destino,
        peso_total,
        volumen_total,
        costo_envio,
        fecha_envio,
        fecha_estimada_entrega,
        fecha_entrega_real,
        observaciones,
        tipo_servicio:tipo_servicio_id(nombre, codigo),
        piezas:detalle_pieza(*),
        prueba_entrega(*)
      `
      )
      .ilike('numero_guia', numeroGuia.trim())
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crea un nuevo envío.
   */
  async create(envioData) {
    // Si no trae número de guía, generamos uno temporal o delegamos a la función/trigger de Postgres
    const payload = {
      ...envioData,
      numero_guia:
        envioData.numero_guia ||
        `FS-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`,
      estado: envioData.estado || 'pendiente',
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza el estado de un envío y opcionalmente registra la auditoría.
   */
  async updateEstado(id, nuevoEstado, observaciones = null) {
    const updatePayload = {
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
    }

    if (nuevoEstado === 'entregado') {
      updatePayload.fecha_entrega_real = new Date().toISOString()
    }

    if (observaciones) {
      updatePayload.observaciones = observaciones
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza datos generales del envío.
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Elimina un envío (si no tiene restricciones de integridad referencial).
   */
  async delete(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene estadísticas rápidas para el dashboard (conteo por estado).
   */
  async getMetricasDashboard() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('estado')

    if (error) throw error

    const counts = {
      total: data.length,
      pendiente: 0,
      en_transito: 0,
      en_reparto: 0,
      entregado: 0,
      devuelto: 0,
      retenido: 0,
    }

    data.forEach((item) => {
      if (counts[item.estado] !== undefined) {
        counts[item.estado]++
      }
    })

    return counts
  },
}

export default envioService
