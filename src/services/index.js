/**
 * Exportación unificada de todos los servicios CRUD de Flash Services Courier Cargo.
 * Esta capa reemplaza completamente los Modelos y Controladores de Laravel Eloquent
 * permitiendo interacción directa con Supabase BaaS desde React.
 */
export { usuarioService } from './usuarioService'
export { personaService } from './personaService'
export { envioService } from './envioService'
export { detallePiezaService } from './detallePiezaService'
export { tipoServicioService } from './tipoServicioService'
export { tarifaService } from './tarifaService'
export { pruebaEntregaService } from './pruebaEntregaService'
export { historialModificacionService } from './historialModificacionService'
export { detalleCobroEnvioService } from './detalleCobroEnvioService'
export { detalleMensualCobroService } from './detalleMensualCobroService'
export { manifiestoDespachoService } from './manifiestoDespachoService'
export { manifiestoEnvioService } from './manifiestoEnvioService'

import usuarioService from './usuarioService'
import personaService from './personaService'
import envioService from './envioService'
import detallePiezaService from './detallePiezaService'
import tipoServicioService from './tipoServicioService'
import tarifaService from './tarifaService'
import pruebaEntregaService from './pruebaEntregaService'
import historialModificacionService from './historialModificacionService'
import detalleCobroEnvioService from './detalleCobroEnvioService'
import detalleMensualCobroService from './detalleMensualCobroService'
import manifiestoDespachoService from './manifiestoDespachoService'
import manifiestoEnvioService from './manifiestoEnvioService'

export const services = {
  usuario: usuarioService,
  persona: personaService,
  envio: envioService,
  detallePieza: detallePiezaService,
  tipoServicio: tipoServicioService,
  tarifa: tarifaService,
  pruebaEntrega: pruebaEntregaService,
  historialModificacion: historialModificacionService,
  detalleCobroEnvio: detalleCobroEnvioService,
  detalleMensualCobro: detalleMensualCobroService,
  manifiestoDespacho: manifiestoDespachoService,
  manifiestoEnvio: manifiestoEnvioService,
}

export default services
