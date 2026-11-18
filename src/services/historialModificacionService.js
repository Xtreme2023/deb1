import { supabase } from '../lib/supabaseClient'

const TABLE = 'historial_modificacion'

/**
 * Servicio para gestión de Auditoría y Trazabilidad (Historial de Modificaciones).
 * Sustituye observadores / triggers de Eloquent y registra cambios en envíos, tarifas, etc.
 */
export const historialModificacionService = {
  /**
   * Obtiene el historial de cambios filtrado por tabla y/o registro específico.
   */
  async getByRegistro(tablaAfectada, registroId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, usuario:modificado_por(id, nombre, apellido, email)')
      .eq('tabla_afectada', tablaAfectada)
      .eq('registro_id', registroId)
      .order('fecha_modificacion', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Obtiene la trazabilidad completa de un envío específico.
   */
  async getHistorialEnvio(envioId) {
    return await this.getByRegistro('envio', envioId)
  },

  /**
   * Obtiene los últimos eventos del sistema.
   */
  async getRecientes({ limit = 50, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*, usuario:modificado_por(id, nombre, apellido, email)', { count: 'exact' })
      .order('fecha_modificacion', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  /**
   * Registra un nuevo evento de auditoría.
   */
  async registrar({
    tablaAfectada,
    registroId,
    accion,
    datosAnteriores = null,
    datosNuevos = null,
    modificadoPor = null,
  }) {
    const payload = {
      tabla_afectada: tablaAfectada,
      registro_id: registroId,
      accion, // 'CREACION', 'ACTUALIZACION_ESTADO', 'MODIFICACION', 'ELIMINACION', etc.
      datos_anteriores: datosAnteriores,
      datos_nuevos: datosNuevos,
      modificado_por: modificadoPor,
      fecha_modificacion: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export default historialModificacionService
