import { supabase } from '../lib/supabaseClient'

const TABLE = 'usuario'

/**
 * Servicio para gestión de Usuarios (operadores, conductores, administradores, clientes).
 * Sustituye el modelo Eloquent User / Usuario.
 */
export const usuarioService = {
  /**
   * Obtiene todos los usuarios con paginación y filtros opcionales.
   */
  async getAll({ rol, activo, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*, persona:persona_id(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (rol) query = query.eq('rol', rol)
    if (activo !== undefined) query = query.eq('activo', activo)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  /**
   * Obtiene un usuario por su ID (UUID).
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
   * Obtiene un usuario por su email.
   */
  async getByEmail(email) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, persona:persona_id(*)')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Registra un nuevo usuario en la base de datos.
   */
  async create(usuarioData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([usuarioData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza los datos de un usuario.
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
   * Elimina un usuario por ID.
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
   * Obtiene los conductores activos disponibles para asignación de manifiestos.
   */
  async getConductoresDisponibles() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, nombre, apellido, telefono, persona:persona_id(*)')
      .eq('rol', 'conductor')
      .eq('activo', true)

    if (error) throw error
    return data
  },
}

export default usuarioService
