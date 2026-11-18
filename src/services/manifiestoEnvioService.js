import { supabase } from '../lib/supabaseClient'

const TABLE = 'manifiesto_envio'

/**
 * Servicio para gestión de la Relación Manifiesto - Envíos.
 * Maneja la inclusión de paquetes en hojas de ruta y su secuencia de entrega.
 */
export const manifiestoEnvioService = {
  /**
   * Obtiene todos los envíos asociados a un manifiesto.
   */
  async getByManifiestoId(manifiestoId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, envio:envio_id(*)')
      .eq('manifiesto_id', manifiestoId)
      .order('orden_entrega', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Obtiene los manifiestos en los que ha viajado un envío específico.
   */
  async getByEnvioId(envioId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, manifiesto:manifiesto_id(*)')
      .eq('envio_id', envioId)

    if (error) throw error
    return data
  },

  /**
   * Asocia un envío a un manifiesto con un orden de entrega.
   */
  async asociarEnvio({ manifiestoId, envioId, ordenEntrega = 1, estadoEntrega = 'cargado' }) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          manifiesto_id: manifiestoId,
          envio_id: envioId,
          orden_entrega: ordenEntrega,
          estado_entrega: estadoEntrega,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Asocia múltiples envíos a un manifiesto de una sola vez.
   */
  async asociarLote(manifiestoId, enviosIds) {
    const registros = enviosIds.map((envioId, index) => ({
      manifiesto_id: manifiestoId,
      envio_id: envioId,
      orden_entrega: index + 1,
      estado_entrega: 'cargado',
    }))

    const { data, error } = await supabase
      .from(TABLE)
      .insert(registros)
      .select()

    if (error) throw error
    return data
  },

  /**
   * Actualiza el estado de entrega o el orden de un paquete en la ruta.
   */
  async updateEstado(id, nuevoEstado) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ estado_entrega: nuevoEstado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Reordena la secuencia de entrega de un envío en el manifiesto.
   */
  async updateOrden(id, nuevoOrden) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ orden_entrega: nuevoOrden })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Remueve un envío del manifiesto.
   */
  async desasociar(id) {
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

export default manifiestoEnvioService
