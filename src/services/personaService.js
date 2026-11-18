import { supabase } from '../lib/supabaseClient'

const TABLE = 'persona'

/**
 * Servicio para gestión de Personas (Remitentes, Destinatarios, Clientes Naturales y Jurídicos).
 * Sustituye el modelo Eloquent Persona.
 */
export const personaService = {
  /**
   * Obtiene personas con búsqueda y filtrado.
   */
  async getAll({ search = '', limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(
        `numero_documento.ilike.%${search}%,nombres.ilike.%${search}%,apellidos.ilike.%${search}%,razon_social.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  /**
   * Obtiene una persona por ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Busca persona por número de documento de identidad o RUC/NIT.
   */
  async getByDocumento(numeroDocumento) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('numero_documento', numeroDocumento)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Crea una nueva persona.
   */
  async create(personaData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([personaData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Busca por documento o la crea si no existe (método típico de courier para remitentes rápidos).
   */
  async findOrCreateByDocumento(personaData) {
    const existing = await this.getByDocumento(personaData.numero_documento)
    if (existing) return existing
    return await this.create(personaData)
  },

  /**
   * Actualiza datos de una persona.
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
   * Elimina un registro de persona.
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

export default personaService
