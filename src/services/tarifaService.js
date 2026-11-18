import { supabase } from '../lib/supabaseClient'

const TABLE = 'tarifa'

/**
 * Servicio para gestión de Tarifas y Tabuladores de Precios.
 * Sustituye el modelo Eloquent Tarifa.
 */
export const tarifaService = {
  /**
   * Obtiene todas las tarifas con la información de su tipo de servicio asociado.
   */
  async getAll({ tipoServicioId, soloActivas = false } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*, tipo_servicio:tipo_servicio_id(*)')
      .order('peso_min', { ascending: true })

    if (tipoServicioId) query = query.eq('tipo_servicio_id', tipoServicioId)
    if (soloActivas) query = query.eq('activo', true)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Obtiene una tarifa por ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, tipo_servicio:tipo_servicio_id(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Calcula o busca la tarifa aplicable para un tipo de servicio y peso específico.
   */
  async getTarifaAplicable(tipoServicioId, pesoKg) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, tipo_servicio:tipo_servicio_id(*)')
      .eq('tipo_servicio_id', tipoServicioId)
      .eq('activo', true)
      .lte('peso_min', pesoKg)
      .gte('peso_max', pesoKg)
      .order('peso_min', { ascending: false })
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Crea una nueva tarifa.
   */
  async create(tarifaData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([tarifaData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza una tarifa existente.
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
   * Elimina una tarifa.
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

export default tarifaService
