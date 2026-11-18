import { supabase } from '../lib/supabaseClient'

const TABLE = 'detalle_cobro_envio'

/**
 * Servicio para gestión de Cobros individuales por Envío (Flete, Seguro, Embalaje, Recargo por Combustible, etc.).
 * Sustituye el modelo Eloquent DetalleCobroEnvio.
 */
export const detalleCobroEnvioService = {
  /**
   * Obtiene todos los cobros asociados a un envío.
   */
  async getByEnvioId(envioId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('envio_id', envioId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Obtiene un cobro por su ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, envio:envio_id(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Registra un nuevo concepto de cobro para un envío.
   */
  async create(cobroData) {
    const payload = {
      ...cobroData,
      monto: Number(cobroData.monto || 0),
      pagado: cobroData.pagado ?? false,
      fecha_cobro: cobroData.fecha_cobro || (cobroData.pagado ? new Date().toISOString() : null),
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
   * Marca un cobro como pagado registrando el método y comprobante.
   */
  async registrarPago(id, { metodoPago, comprobantePago }) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        pagado: true,
        metodo_pago: metodoPago,
        comprobante_pago: comprobantePago,
        fecha_cobro: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza los datos de un cobro.
   */
  async update(id, updates) {
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
   * Elimina un cobro.
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

export default detalleCobroEnvioService
