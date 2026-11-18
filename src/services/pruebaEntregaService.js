import { supabase } from '../lib/supabaseClient'

const TABLE = 'prueba_entrega'
const BUCKET = 'constancias'

/**
 * Servicio para gestión de Pruebas y Constancias de Entrega (POD - Proof of Delivery).
 * Sustituye el modelo Eloquent PruebaEntrega y se integra con Supabase Storage.
 */
export const pruebaEntregaService = {
  /**
   * Obtiene la constancia de entrega asociada a un envío.
   */
  async getByEnvioId(envioId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, envio:envio_id(numero_guia, estado, destinatario:destinatario_id(nombres, apellidos, razon_social))')
      .eq('envio_id', envioId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Obtiene una prueba de entrega por ID.
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
   * Lista todas las pruebas de entrega registradas con paginación.
   */
  async getAll({ limit = 50, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*, envio:envio_id(numero_guia, estado, origen, destino)', { count: 'exact' })
      .order('fecha_entrega', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  /**
   * Sube una imagen al bucket de Supabase Storage 'constancias'.
   * Genera una ruta única basada en el ID del envío y timestamp.
   *
   * @param {File|Blob} file - Archivo de imagen (JPG, PNG, WebP)
   * @param {string} envioId - ID o UUID del envío
   * @returns {Promise<{ path: string, publicUrl: string }>}
   */
  async uploadConstanciaFile(file, envioId) {
    if (!file) throw new Error('Se requiere un archivo de imagen válido')

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `envios/${envioId}/${fileName}`

    // 1. Subida al bucket de Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })

    if (uploadError) {
      throw new Error(`Error al subir la constancia a Storage: ${uploadError.message}`)
    }

    // 2. Obtención de URL Pública
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      publicUrl: publicData.publicUrl,
    }
  },

  /**
   * Crea un registro de prueba de entrega en la tabla.
   */
  async create(pruebaData) {
    const payload = {
      ...pruebaData,
      fecha_entrega: pruebaData.fecha_entrega || new Date().toISOString(),
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
   * Flujo integral: Sube la imagen a Storage, guarda en prueba_entrega
   * y actualiza el estado del envío a 'entregado'.
   */
  async registrarEntregaCompleta({
    envioId,
    file,
    receptorNombre,
    receptorDocumento,
    comentarios = '',
    latitud = null,
    longitud = null,
    createdBy = null,
  }) {
    // 1. Subir archivo a Storage
    const { publicUrl, path } = await this.uploadConstanciaFile(file, envioId)

    // 2. Insertar en tabla prueba_entrega
    const pruebaRegistro = await this.create({
      envio_id: envioId,
      receptor_nombre: receptorNombre,
      receptor_documento: receptorDocumento,
      ruta_imagen: publicUrl, // URL pública accesible
      comentarios,
      latitud,
      longitud,
      fecha_entrega: new Date().toISOString(),
      created_by: createdBy,
    })

    // 3. Actualizar estado del envío
    const { error: envioError } = await supabase
      .from('envio')
      .update({
        estado: 'entregado',
        fecha_entrega_real: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', envioId)

    if (envioError) {
      console.warn('Aviso: Constancia guardada pero falló la actualización del estado del envío:', envioError)
    }

    return {
      prueba: pruebaRegistro,
      storagePath: path,
      publicUrl,
    }
  },

  /**
   * Actualiza una constancia de entrega.
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
   * Elimina un registro de constancia de entrega.
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

export default pruebaEntregaService
