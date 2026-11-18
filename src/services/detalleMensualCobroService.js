import { supabase } from '../lib/supabaseClient'

const TABLE = 'detalle_mensual_cobro'

/**
 * Servicio para Facturación y Liquidación Mensual de Clientes Corporativos / Cuentas Corrientes.
 * Sustituye el modelo Eloquent DetalleMensualCobro.
 */
export const detalleMensualCobroService = {
  /**
   * Obtiene las liquidaciones mensuales con filtros de cliente, año o estado.
   */
  async getAll({ personaId, anio, pagado, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*, persona:persona_id(*)', { count: 'exact' })
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .range(offset, offset + limit - 1)

    if (personaId) query = query.eq('persona_id', personaId)
    if (anio) query = query.eq('anio', anio)
    if (pagado !== undefined) query = query.eq('pagado', pagado)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  /**
   * Obtiene una liquidación mensual por ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, persona:persona_id(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene la liquidación de un cliente para un periodo específico.
   */
  async getByClientePeriodo(personaId, mes, anio) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, persona:persona_id(*)')
      .eq('persona_id', personaId)
      .eq('mes', mes)
      .eq('anio', anio)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Crea una nueva liquidación mensual.
   */
  async create(liquidacionData) {
    const payload = {
      ...liquidacionData,
      total_envios: Number(liquidacionData.total_envios || 0),
      monto_total: Number(liquidacionData.monto_total || 0),
      pagado: liquidacionData.pagado ?? false,
      estado: liquidacionData.estado || 'pendiente',
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
   * Actualiza el estado y datos de una liquidación.
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
   * Registra el pago total de la liquidación mensual.
   */
  async registrarPago(id, { fechaFacturacion = new Date().toISOString(), estado = 'pagado' } = {}) {
    return await this.update(id, {
      pagado: true,
      fecha_facturacion: fechaFacturacion,
      estado,
    })
  },

  /**
   * Elimina una liquidación mensual.
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

export default detalleMensualCobroService
