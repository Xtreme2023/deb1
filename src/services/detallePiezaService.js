import { supabase } from '../lib/supabaseClient'

const TABLE = 'detalle_pieza'

/**
 * Servicio para gestión de Piezas o Bultos que componen un Envío.
 * Sustituye el modelo Eloquent DetallePieza.
 */
export const detallePiezaService = {
  /**
   * Obtiene todas las piezas asociadas a un envío.
   */
  async getByEnvioId(envioId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('envio_id', envioId)
      .order('numero_pieza', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Obtiene una pieza específica por ID.
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
   * Registra una o varias piezas para un envío.
   * Calcula automáticamente el peso volumétrico: (largo * ancho * alto) / 5000 (estándar IATA courier).
   */
  async create(piezaData) {
    const largo = Number(piezaData.largo || 0)
    const ancho = Number(piezaData.ancho || 0)
    const alto = Number(piezaData.alto || 0)

    const pesoVolumetrico =
      piezaData.peso_volumetrico !== undefined
        ? piezaData.peso_volumetrico
        : largo && ancho && alto
        ? Number(((largo * ancho * alto) / 5000).toFixed(2))
        : 0

    const payload = {
      ...piezaData,
      peso_volumetrico: pesoVolumetrico,
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
   * Inserta un lote de piezas para un envío.
   */
  async createBatch(piezasArray) {
    const prepared = piezasArray.map((pieza, index) => {
      const largo = Number(pieza.largo || 0)
      const ancho = Number(pieza.ancho || 0)
      const alto = Number(pieza.alto || 0)
      const pesoVol =
        pieza.peso_volumetrico ||
        (largo && ancho && alto ? Number(((largo * ancho * alto) / 5000).toFixed(2)) : 0)

      return {
        ...pieza,
        numero_pieza: pieza.numero_pieza || index + 1,
        peso_volumetrico: pesoVol,
      }
    })

    const { data, error } = await supabase
      .from(TABLE)
      .insert(prepared)
      .select()

    if (error) throw error
    return data
  },

  /**
   * Actualiza datos de una pieza.
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
   * Elimina una pieza.
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

export default detallePiezaService
