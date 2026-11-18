import { supabase } from '../lib/supabaseClient'

const TABLE = 'manifiesto_despacho'

/**
 * Servicio para gestión de Manifiestos de Despacho / Hojas de Ruta de Carga.
 * Sustituye el modelo Eloquent ManifiestoDespacho.
 */
export const manifiestoDespachoService = {
  /**
   * Obtiene todos los manifiestos con filtros y relaciones.
   */
  async getAll({ estado, conductorId, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        conductor:conductor_id(id, nombre, apellido, email, telefono),
        envios:manifiesto_envio(count)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (estado) query = query.eq('estado', estado)
    if (conductorId) query = query.eq('conductor_id', conductorId)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  /**
   * Obtiene un manifiesto por ID con todos sus envíos asignados en orden de entrega.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        conductor:conductor_id(*),
        manifiesto_envios:manifiesto_envio(
          id,
          orden_entrega,
          estado_entrega,
          envio:envio_id(
            id,
            numero_guia,
            estado,
            direccion_destino,
            peso_total,
            remitente:remitente_id(nombres, apellidos, razon_social),
            destinatario:destinatario_id(nombres, apellidos, razon_social, telefono)
          )
        )
      `
      )
      .eq('id', id)
      .order('orden_entrega', { referencedTable: 'manifiesto_envio', ascending: true })
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene manifiesto por su código único de despacho.
   */
  async getByCodigo(codigoManifiesto) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, conductor:conductor_id(*)')
      .eq('codigo_manifiesto', codigoManifiesto)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crea un nuevo manifiesto de despacho.
   */
  async create(manifiestoData) {
    const payload = {
      ...manifiestoData,
      codigo_manifiesto:
        manifiestoData.codigo_manifiesto ||
        `MAN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      estado: manifiestoData.estado || 'preparacion',
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
   * Actualiza el estado del manifiesto (ej: 'preparacion' -> 'en_ruta' -> 'finalizado').
   */
  async updateEstado(id, nuevoEstado) {
    const updates = {
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
    }

    if (nuevoEstado === 'en_ruta') {
      updates.fecha_salida = new Date().toISOString()
    } else if (nuevoEstado === 'finalizado') {
      updates.fecha_llegada = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza datos generales del manifiesto.
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
   * Elimina un manifiesto.
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
}

export default manifiestoDespachoService
