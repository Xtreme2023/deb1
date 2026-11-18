import { supabase } from '../lib/supabaseClient'

const TABLE = 'tipo_servicio'

/**
 * Servicio para gestión de Tipos de Servicio de Envíos.
 * (Ej.: Flash Express, Courier Standard, Carga Pesada, Same Day).
 */
export const tipoServicioService = {
  /**
   * Obtiene todos los tipos de servicios.
   */
  async getAll({ soloActivos = false } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*')
      .order('nombre', { ascending: true })

    if (soloActivos) {
      query = query.eq('activo', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Obtiene un tipo de servicio por ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, tarifas:tarifa(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene un tipo de servicio por código corto (ej: 'EXPRESS', 'ESTANDAR').
   */
  async getByCodigo(codigo) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, tarifas:tarifa(*)')
      .eq('codigo', codigo)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crea un tipo de servicio.
   */
  async create(servicioData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([servicioData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza un tipo de servicio.
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
   * Elimina un tipo de servicio.
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

export default tipoServicioService
