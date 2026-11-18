import React, { useState, useEffect } from 'react'
import UploadProofOfDelivery from './components/UploadProofOfDelivery'
import LoginScreen from './components/LoginScreen'
import TrackingQrModal from './components/TrackingQrModal'
import CreateShipmentModal from './components/CreateShipmentModal'
import authService from './services/authService'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import {
  Package,
  Truck,
  FileCode2,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Layers,
  Search,
  QrCode,
  Plus,
  LogOut,
  Users,
  FileCheck,
  MapPin,
  TrendingUp
} from 'lucide-react'

// Envíos iniciales vinculados a los clientes de prueba
const INITIAL_ENVIOS = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    numeroGuia: 'FS-94821-EXP',
    remitente: 'Corporación Textil Cochabamba S.A.',
    remitenteEmail: 'roberto.gomez@corporaciontextil.com',
    destinatario: 'Estudio Jurídico Morales & Asoc.',
    tipoServicio: 'Flash Express 24h',
    origen: 'Cochabamba - Oficina Central',
    destino: 'Queru Queru, Cochabamba',
    direccion_destino: 'Av. Melchor Pérez de Holguín 1250, Of. 902, Queru Queru',
    estado: 'en_reparto',
    piezas: 2,
    peso: '4.8 kg',
    costo: 'Bs 48.00',
    fecha_envio: '2026-11-18T08:30:00Z',
    observaciones: 'Muestras textiles de exportación. Entrega prioritaria.',
    conductor: 'Diego Alonso Quispe',
  },
  {
    id: '7b29a8a1-c309-4d8b-90f1-112233445566',
    numeroGuia: 'FS-88210-STD',
    remitente: 'Droguería & Farmacéutica Andina S.A.',
    remitenteEmail: 'ana.valdivia@farmaceutica-andina.pe',
    destinatario: 'Clínica San Gabriel',
    tipoServicio: 'Courier Terrestre',
    origen: 'Cochabamba - Zona Industrial',
    destino: 'Centro de Cochabamba',
    direccion_destino: 'Av. Ayacucho 612, entre Heroínas y Colombia',
    estado: 'en_transito',
    piezas: 5,
    peso: '18.5 kg',
    costo: 'Bs 145.00',
    fecha_envio: '2026-11-17T15:20:00Z',
    observaciones: 'Medicamentos con cadena de frío termo-controlada.',
    conductor: 'María Elena Fernández',
  },
  {
    id: '3c19b2e4-9988-410a-b123-abcdef012345',
    numeroGuia: 'FS-77102-CAR',
    remitente: 'Tech Import Cochabamba E.I.R.L.',
    remitenteEmail: 'marcos.herrera@techimport.com',
    destinatario: 'Retail Bolivia Almacenes',
    tipoServicio: 'Flash Cargo Aéreo',
    origen: 'Cochabamba - Terminal de Carga',
    destino: 'Zona Norte, Cochabamba',
    direccion_destino: 'Av. Circunvalación 1204, local 3, Cala Cala',
    estado: 'en_almacen',
    piezas: 12,
    peso: '120.0 kg',
    costo: 'Bs 850.00',
    fecha_envio: '2026-11-18T10:00:00Z',
    observaciones: 'Equipos tecnológicos y tablets educativas frágiles.',
    conductor: 'Fernando Mendoza Díaz',
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-112233445577',
    numeroGuia: 'FS-65432-EXP',
    remitente: 'Patricia Silva Romero',
    remitenteEmail: 'patricia.silva@gmail.com',
    destinatario: 'Dra. Gabriela Silva R.',
    tipoServicio: 'Flash Express 24h',
    origen: 'Cochabamba - Zona Central',
    destino: 'Sarco, Cochabamba',
    direccion_destino: 'Calle Antezana 380, edificio Los Olivos, Sarco',
    estado: 'entregado',
    piezas: 1,
    peso: '1.2 kg',
    costo: 'Bs 32.00',
    fecha_envio: '2026-11-16T09:15:00Z',
    fecha_entrega: '2026-11-17T11:40:00Z',
    observaciones: 'Documentos notariales sellados en sobre de seguridad.',
    receptor: 'Dra. Gabriela Silva R. (DNI: 41908234)',
  },
  {
    id: '9f8e7d6c-5b4a-3f2e-1d0c-998877665544',
    numeroGuia: 'FS-54321-STD',
    remitente: 'Fernando Vargas Cornejo',
    remitenteEmail: 'fernando.vargas@outlook.com',
    destinatario: 'Importadora del Norte S.R.L.',
    tipoServicio: 'Courier Terrestre',
    origen: 'Cochabamba - Zona Este',
    destino: 'Tiquipaya, Cochabamba',
    direccion_destino: 'Av. Ecológica 780, urbanización El Bosque',
    estado: 'entregado',
    piezas: 3,
    peso: '8.4 kg',
    costo: 'Bs 72.00',
    fecha_envio: '2026-11-15T14:10:00Z',
    fecha_entrega: '2026-11-17T16:20:00Z',
    observaciones: 'Repuestos mecánicos automotrices embalados.',
    receptor: 'Luis Alberto Cornejo (DNI: 10492837)',
  },
]

// Mapeo explicativo de las 12 tablas y sus servicios BaaS
const SERVICIOS_MAP = [
  {
    tabla: 'usuario',
    servicio: 'usuarioService.js',
    descripcion: 'Operadores, conductores y administradores con roles.',
    ejemplo: "supabase.from('usuario').select('*, persona(*)').eq('rol', 'conductor')",
  },
  {
    tabla: 'persona',
    servicio: 'personaService.js',
    descripcion: 'Clientes particulares, remitentes, destinatarios y corporativos.',
    ejemplo: "supabase.from('persona').select('*').ilike('numero_documento', doc)",
  },
  {
    tabla: 'envio',
    servicio: 'envioService.js',
    descripcion: 'Entidad central de envíos con trazabilidad de estado.',
    ejemplo: "supabase.from('envio').select('*, remitente(*), destinatario(*), piezas(*)')",
  },
  {
    tabla: 'detalle_pieza',
    servicio: 'detallePiezaService.js',
    descripcion: 'Bultos individuales, dimensiones y cálculo peso volumétrico.',
    ejemplo: "supabase.from('detalle_pieza').insert(piezasArray)",
  },
  {
    tabla: 'tipo_servicio',
    servicio: 'tipoServicioService.js',
    descripcion: 'Modalidades de transporte (Express, Estándar, Same Day).',
    ejemplo: "supabase.from('tipo_servicio').select('*').eq('activo', true)",
  },
  {
    tabla: 'tarifa',
    servicio: 'tarifaService.js',
    descripcion: 'Matriz de precios por tramos de peso y servicio.',
    ejemplo: "supabase.from('tarifa').select('*').lte('peso_min', peso).gte('peso_max', peso)",
  },
  {
    tabla: 'prueba_entrega',
    servicio: 'pruebaEntregaService.js',
    descripcion: 'Constancia fotográfica, GPS y datos del receptor (POD).',
    ejemplo: "supabase.from('prueba_entrega').insert({ envio_id, ruta_imagen, ... })",
  },
  {
    tabla: 'historial_modificacion',
    servicio: 'historialModificacionService.js',
    descripcion: 'Log de auditoría y trazabilidad histórica de eventos.',
    ejemplo: "supabase.from('historial_modificacion').select('*').eq('registro_id', id)",
  },
  {
    tabla: 'detalle_cobro_envio',
    servicio: 'detalleCobroEnvioService.js',
    descripcion: 'Desglose de flete, seguro, embalaje y métodos de pago.',
    ejemplo: "supabase.from('detalle_cobro_envio').select('*').eq('envio_id', id)",
  },
  {
    tabla: 'detalle_mensual_cobro',
    servicio: 'detalleMensualCobroService.js',
    descripcion: 'Facturación consolidada mensual de cuentas corporativas.',
    ejemplo: "supabase.from('detalle_mensual_cobro').select('*').eq('persona_id', id)",
  },
  {
    tabla: 'manifiesto_despacho',
    servicio: 'manifiestoDespachoService.js',
    descripcion: 'Hojas de ruta para conductores y asignación de vehículos.',
    ejemplo: "supabase.from('manifiesto_despacho').select('*, conductor(*), envios(*)')",
  },
  {
    tabla: 'manifiesto_envio',
    servicio: 'manifiestoEnvioService.js',
    descripcion: 'Pivote con secuencia de entrega ordenada para cada conductor.',
    ejemplo: "supabase.from('manifiesto_envio').insert({ manifiesto_id, envio_id, orden })",
  },
]

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())
  const [envios, setEnvios] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('flash_courier_envios') || 'null')
      return Array.isArray(stored) ? stored : INITIAL_ENVIOS
    } catch {
      return INITIAL_ENVIOS
    }
  })
  const [activeTab, setActiveTab] = useState('envios') // 'envios', 'pod', 'usuarios', 'servicios', 'sql'
  const [selectedEnvioForPod, setSelectedEnvioForPod] = useState(INITIAL_ENVIOS[0])

  // Modales de Código QR y Nueva Guía
  const [selectedEnvioForQr, setSelectedEnvioForQr] = useState(null)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Filtros y búsquedas
  const [searchTerm, setSearchTerm] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [copiedSql, setCopiedSql] = useState(false)
  const [notification, setNotification] = useState(null)
  const [accounts, setAccounts] = useState(() => authService.getCuentas())
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accountForm, setAccountForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '123456',
    rol: 'empleado',
    documento: '',
    telefono: '',
    empresa: '',
  })
  const [passwordAccountId, setPasswordAccountId] = useState(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [accountError, setAccountError] = useState('')

  // Cargar envíos desde Supabase si la tabla está disponible
  useEffect(() => {
    const fetchSupabaseEnvios = async () => {
      try {
        if (supabase) {
          const { data } = await supabase
            .from('envio')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

          if (data && data.length > 0) {
            // Combinar con los existentes sin duplicar
            const formatted = data.map((d) => ({
              id: d.id,
              numeroGuia: d.numero_guia,
              remitente: d.remitente?.razon_social || d.remitente?.nombres || 'Cliente Registrado',
              destinatario: d.destinatario?.razon_social || d.destinatario?.nombres || 'Destinatario',
              tipoServicio: 'Flash Express 24h',
              origen: d.origen || 'Cochabamba - Oficina Central',
              destino: d.destino || 'Destino Nacional',
              direccion_destino: d.direccion_destino || d.destino,
              estado: d.estado || 'pendiente',
              piezas: 1,
              peso: `${d.peso_total || 2.0} kg`,
              fecha_envio: d.fecha_envio || d.created_at,
            }))
            setEnvios((prev) => {
              const prevGuías = new Set(prev.map((e) => e.numeroGuia))
              const news = formatted.filter((f) => !prevGuías.has(f.numeroGuia))
              return [...news, ...prev]
            })
          }
        }
      } catch {
        // Fallback no bloqueante
      }
    }
    fetchSupabaseEnvios()
  }, [])

  useEffect(() => {
    localStorage.setItem('flash_courier_envios', JSON.stringify(envios))
  }, [envios])

  // Ajustar tab inicial según rol al iniciar sesión
  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    if (user.rol === 'cliente') {
      setActiveTab('envios')
    } else if (user.rol === 'empleado') {
      setActiveTab('envios')
    } else {
      setActiveTab('envios')
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  // Abrir modal QR para una guía específica
  const handleOpenQr = (envio) => {
    setSelectedEnvioForQr(envio)
    setIsQrModalOpen(true)
  }

  // Cuando se crea una nueva guía: agregar al estado y abrir inmediatamente su QR
  const handleShipmentCreated = (nuevoEnvio) => {
    const envioCreado = {
      ...nuevoEnvio,
      remitenteEmail: nuevoEnvio.remitenteEmail || currentUser.email,
      creadoPor: currentUser.email,
      creadoPorRol: currentUser.rol,
    }
    setEnvios((prev) => [envioCreado, ...prev])
    setIsCreateModalOpen(false)
    setSelectedEnvioForQr(envioCreado)
    setIsQrModalOpen(true)

    setNotification(`¡Guía ${envioCreado.numeroGuia} creada! Visible para administrador y empleados.`)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleTrackingSubmit = (e) => {
    e.preventDefault()
    const code = trackingCode.trim().toUpperCase()
    if (!code) return

    const match = envios.find((envio) => (envio.numeroGuia || '').toUpperCase() === code)
    if (match) {
      setTrackingResult(match)
      return
    }

    setTrackingResult(false)
  }

  const refreshAccounts = () => setAccounts(authService.getCuentas())

  const handleCreateAccount = (e) => {
    e.preventDefault()
    setAccountError('')
    const result = authService.createCuenta(accountForm)
    if (!result.success) {
      setAccountError(result.error)
      return
    }
    refreshAccounts()
    setShowAccountForm(false)
    setAccountForm({
      nombre: '', apellido: '', email: '', password: '123456', rol: 'empleado',
      documento: '', telefono: '', empresa: '',
    })
    setNotification(`Cuenta creada para ${result.user.nombre} ${result.user.apellido}`)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleToggleAccount = (account) => {
    const result = authService.updateCuenta(account.id, { activo: account.activo === false })
    if (!result.success) {
      setNotification(result.error)
    } else {
      refreshAccounts()
      setNotification(account.activo === false ? 'Cuenta reactivada.' : 'Cuenta puesta en pausa.')
    }
    setTimeout(() => setNotification(null), 4000)
  }

  const handleDeleteAccount = (account) => {
    if (!window.confirm(`¿Eliminar definitivamente la cuenta de ${account.nombre} ${account.apellido}?`)) return
    const result = authService.deleteCuenta(account.id)
    if (!result.success) {
      setNotification(result.error)
    } else {
      refreshAccounts()
      setNotification('Cuenta eliminada.')
    }
    setTimeout(() => setNotification(null), 4000)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    const result = authService.changePassword(passwordAccountId, passwordValue)
    if (!result.success) {
      setAccountError(result.error)
      return
    }
    refreshAccounts()
    setPasswordAccountId(null)
    setPasswordValue('')
    setAccountError('')
    setNotification('Contraseña actualizada correctamente.')
    setTimeout(() => setNotification(null), 4000)
  }

  // Copiar SQL de permisos y migraciones
  const handleCopySql = () => {
    const sqlText = `-- Flash Services Courier Cargo - Permisos y Semilla de Usuarios
-- 1 Administrador, 5 Empleados y 5 Clientes (Contraseña común: 123456)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`
    navigator.clipboard.writeText(sqlText)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  // Si no hay usuario logueado, mostrar la pantalla de Login
  if (!currentUser) {
    return (
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    )
  }

  // Filtrado de envíos según rol y buscador
  const filteredEnvios = envios.filter((envio) => {
    // Si es cliente, filtrar solo envíos donde es remitente o coincide con su correo/nombre
    if (currentUser.rol === 'cliente') {
      const matchEmail =
        envio.remitenteEmail?.toLowerCase() === currentUser.email.toLowerCase()
      const matchName =
        envio.remitente?.toLowerCase().includes(currentUser.nombre.toLowerCase()) ||
        (currentUser.empresa &&
          envio.remitente?.toLowerCase().includes(currentUser.empresa.toLowerCase()))
      if (!matchEmail && !matchName) return false
    }

    // Filtro por estado
    if (statusFilter !== 'todos' && envio.estado !== statusFilter) {
      return false
    }

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const guia = (envio.numeroGuia || '').toLowerCase()
      const rem = (envio.remitente || '').toLowerCase()
      const dest = (envio.destinatario || '').toLowerCase()
      const orig = (envio.origen || '').toLowerCase()
      const dCity = (envio.destino || '').toLowerCase()
      return (
        guia.includes(term) ||
        rem.includes(term) ||
        dest.includes(term) ||
        orig.includes(term) ||
        dCity.includes(term)
      )
    }

    return true
  })

  // Métricas rápidas
  const totalEnvios = envios.length
  const entregadosCount = envios.filter((e) => e.estado === 'entregado').length
  const enRepartoCount = envios.filter((e) => e.estado === 'en_reparto').length
  const enTransitoCount = envios.filter((e) => e.estado === 'en_transito').length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Institucional Limpio y Elegante */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10">
              <Truck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  Flash Services
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 tracking-wider">
                  COURIER CARGO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Logística Serverless &bull; React + Supabase BaaS
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Supabase Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Supabase Demo'}</span>
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 bg-slate-100/90 border border-slate-200/90 pl-2 pr-3.5 py-1.5 rounded-2xl">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                  currentUser.avatarColor || 'from-blue-600 to-indigo-600'
                } text-white flex items-center justify-center font-bold text-xs shadow-sm`}
              >
                {currentUser.nombre.charAt(0)}
                {currentUser.apellido ? currentUser.apellido.charAt(0) : ''}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.nombre} {currentUser.apellido || ''}
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span
                    className={`font-bold capitalize ${
                      currentUser.rol === 'admin'
                        ? 'text-indigo-700'
                        : currentUser.rol === 'empleado'
                        ? 'text-blue-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {currentUser.rol === 'admin'
                      ? '👑 Admin'
                      : currentUser.rol === 'empleado'
                      ? '👷 Empleado'
                      : '🏢 Cliente'}
                  </span>
                  {currentUser.empresa && (
                    <span className="text-slate-500 hidden sm:inline">
                      &bull; {currentUser.empresa}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAccountError('')
                setPasswordAccountId(currentUser.id)
                setPasswordValue('')
              }}
              title="Cambiar mi contraseña"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 transition text-[11px] font-bold"
            >
              Clave
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Elegante */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 border-t border-slate-200/80">
          <button
            onClick={() => setActiveTab('envios')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'envios'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-400" />
            {currentUser.rol === 'cliente' ? 'Mis Envíos y Trazabilidad' : 'Monitor de Envíos'}
          </button>

          <button
            onClick={() => setActiveTab('seguimiento')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'seguimiento'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-400" />
            Seguimiento y QR
          </button>

          {currentUser.rol !== 'cliente' && (
            <button
              onClick={() => setActiveTab('pod')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'pod'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Constancia de Entrega (POD)
            </button>
          )}

          {currentUser.rol === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'usuarios'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                11 Cuentas &amp; Roles
              </button>

              <button
                onClick={() => setActiveTab('servicios')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'servicios'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                12 Servicios BaaS
              </button>

              <button
                onClick={() => setActiveTab('sql')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'sql'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                Script SQL &amp; Permisos
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {activeTab === 'seguimiento' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
              <span className="text-[10px] uppercase tracking-[0.18em] text-indigo-300 font-bold">
                Herramienta de {currentUser.rol === 'cliente' ? 'cliente' : 'operaciones'}
              </span>
              <h2 className="text-2xl font-black mt-2">Consulta una guía</h2>
              <p className="text-sm text-slate-300 mt-1">
                Busca por número de guía y accede a su código QR desde tu espacio de trabajo.
              </p>
              <form onSubmit={handleTrackingSubmit} className="flex flex-col sm:flex-row gap-3 mt-6">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ej. FS-94821-EXP"
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-900 text-sm uppercase font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition"
                >
                  Consultar guía
                </button>
              </form>
            </div>

            {trackingResult === false && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                No se encontró la guía <strong>{trackingCode.trim().toUpperCase()}</strong>.
                Verifica el número e inténtalo nuevamente.
              </div>
            )}

            {trackingResult && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600">
                    Guía encontrada
                  </span>
                  <h3 className="font-mono text-xl font-black text-slate-900 mt-1">
                    {trackingResult.numeroGuia}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {trackingResult.origen} <ArrowRight className="inline w-4 h-4 mx-1" /> {trackingResult.destino}
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                    {trackingResult.estado.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenQr(trackingResult)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  <QrCode className="w-4 h-4 text-indigo-300" />
                  Ver código QR
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: MONITOR DE ENVÍOS (Para todos los roles) */}
        {activeTab === 'envios' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    {currentUser.rol === 'cliente' ? 'Mis Guías Totales' : 'Total de Envíos'}
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {currentUser.rol === 'cliente' ? filteredEnvios.length : totalEnvios}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    En Reparto Hoy
                  </span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">
                    {enRepartoCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    En Tránsito Interurbano
                  </span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">
                    {enTransitoCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Entregados con POD
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {entregadosCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Header de Acción: Búsqueda, Filtros y Botón de Nueva Guía con QR */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {currentUser.rol === 'cliente'
                    ? 'Trazabilidad de Mis Envíos'
                    : 'Monitor de Despachos y Envíos'}
                </h2>
                <p className="text-xs text-slate-500">
                  {currentUser.rol === 'cliente'
                    ? 'Consulta tus paquetes, descarga códigos QR o verifica constancias fotográficas de entrega.'
                    : 'Control de operaciones logísticas respaldado en Supabase PostgreSQL & Storage.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por guía, cliente o ciudad..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 bg-white"
                  />
                </div>

                {/* Filter Selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white text-slate-700"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="en_reparto">En Reparto</option>
                  <option value="en_transito">En Tránsito</option>
                  <option value="en_almacen">En Almacén</option>
                  <option value="entregado">Entregado</option>
                </select>

                {/* Botón "+ Nueva Guía" (Genera y Descarga QR) */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-slate-900/10 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Guía &amp; Generar QR
                </button>
              </div>
            </div>

            {/* Listado de Guías / Cards */}
            {filteredEnvios.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No se encontraron envíos con los criterios seleccionados
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Prueba modificando los términos de búsqueda o cambiando el filtro de estado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEnvios.map((envio) => (
                  <div
                    key={envio.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Guía + Estado */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {envio.numeroGuia}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            envio.estado === 'entregado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : envio.estado === 'en_reparto'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ● {envio.estado.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Info de Remitente & Destinatario */}
                      <div className="space-y-2 text-xs mb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Remitente
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {envio.remitente}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Destinatario &amp; Destino
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {envio.destinatario}
                          </span>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{envio.destino}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-indigo-700">{envio.tipoServicio}</span>
                          <span className="font-semibold text-slate-700">{envio.peso}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción (QR y POD) */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      {/* Botón Ver y Descargar QR */}
                      <button
                        onClick={() => handleOpenQr(envio)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ver / Bajar QR</span>
                      </button>

                      {/* Botón Constancia POD */}
                      {currentUser.rol !== 'cliente' ? (
                        <button
                          onClick={() => {
                            setSelectedEnvioForPod(envio)
                            setActiveTab('pod')
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-bold text-xs transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Subir POD</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenQr(envio)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Rótulo Guía</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONSTANCIA DE ENTREGA POD (Proof of Delivery) */}
        {activeTab === 'pod' && currentUser.rol !== 'cliente' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Context Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 inline-block">
                  Módulo de Entrega en Destino
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  Certificación de Constancias en Supabase Storage
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
                  Sube fotografías al bucket <code className="text-indigo-600 font-bold">constancias</code>,
                  obtiene su URL pública y guarda los metadatos en la tabla{' '}
                  <code className="text-emerald-600 font-bold">prueba_entrega</code> actualizando el estado del
                  envío a entregado.
                </p>
              </div>

              {/* Selector de Envío Activo */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Guía Seleccionada:
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedEnvioForPod.numeroGuia}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <button
                  onClick={() => setActiveTab('envios')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  Cambiar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Componente UploadProofOfDelivery Rediseñado */}
            <div className="max-w-4xl mx-auto">
              <UploadProofOfDelivery
                key={selectedEnvioForPod.id}
                envioId={selectedEnvioForPod.id}
                numeroGuia={selectedEnvioForPod.numeroGuia}
                onSuccess={() => {
                  setNotification(`¡Constancia para ${selectedEnvioForPod.numeroGuia} registrada con éxito!`)
                  setTimeout(() => setNotification(null), 4000)
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: 11 CUENTAS & ROLES (Admin) */}
        {activeTab === 'usuarios' && currentUser.rol === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Control de Cuentas Autorizadas
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  1 Administrador, 5 Empleados y 5 Clientes
                </h2>
                <p className="text-xs text-slate-500">
                  Contraseña universal para todas las cuentas de prueba: <code className="font-bold text-indigo-600 font-mono">123456</code>.
                  Listado sincronizado con el archivo <code className="text-slate-700 font-mono">CUENTAS_DE_PRUEBA.md</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {accounts.filter((account) => account.activo !== false).length} Cuentas Activas
                </span>
                <button
                  onClick={() => {
                    setAccountError('')
                    setShowAccountForm((value) => !value)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear cuenta
                </button>
              </div>
            </div>

            {showAccountForm && (
              <form onSubmit={handleCreateAccount} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
                {accountError && (
                  <div className="md:col-span-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {accountError}
                  </div>
                )}
                <input required placeholder="Nombre" value={accountForm.nombre} onChange={(e) => setAccountForm({ ...accountForm, nombre: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                <input required placeholder="Apellido" value={accountForm.apellido} onChange={(e) => setAccountForm({ ...accountForm, apellido: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                <input required type="email" placeholder="Correo" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                <input required minLength={4} type="password" placeholder="Contraseña" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                <select value={accountForm.rol} onChange={(e) => setAccountForm({ ...accountForm, rol: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300">
                  <option value="empleado">Empleado</option>
                  <option value="cliente">Cliente</option>
                </select>
                {accountForm.rol === 'cliente' ? (
                  <input placeholder="Empresa (opcional)" value={accountForm.empresa} onChange={(e) => setAccountForm({ ...accountForm, empresa: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                ) : (
                  <input placeholder="Documento" value={accountForm.documento} onChange={(e) => setAccountForm({ ...accountForm, documento: e.target.value })} className="px-3 py-2 text-xs rounded-xl border border-slate-300" />
                )}
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAccountForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Crear cuenta</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          usr.rol === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : usr.rol === 'empleado'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {usr.rol === 'admin'
                          ? '👑 Administrador'
                          : usr.rol === 'empleado'
                          ? '👷 Empleado'
                          : '🏢 Cliente'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {usr.documento}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">
                      {usr.nombre} {usr.apellido}
                    </h3>
                    {usr.empresa && (
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">{usr.empresa}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1 font-mono">{usr.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{usr.cargo || usr.tipoCliente}</p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      <strong className={usr.activo === false ? 'text-rose-600' : 'text-emerald-700'}>
                        {usr.activo === false ? 'EN PAUSA' : 'ACTIVA'}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {usr.rol !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleAccount(usr)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold"
                          >
                            {usr.activo === false ? 'Reactivar' : 'Pausar'}
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(usr)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setAccountError('')
                          setPasswordAccountId(usr.id)
                          setPasswordValue('')
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold"
                      >
                        Contraseña
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 12 SERVICIOS (CRUD BAAS) (Admin) */}
        {activeTab === 'servicios' && currentUser.rol === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                Arquitectura Supabase BaaS
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                12 Servicios Relacionales (Reemplazo Integral de Laravel Eloquent)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
                La aplicación consume directamente la base de datos mediante funciones asíncronas en{' '}
                <code className="text-indigo-600 font-bold font-mono">src/services/</code> aprovechando
                PostgREST, uniones relacionales automáticas y Row Level Security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICIOS_MAP.map((item, idx) => (
                <div
                  key={item.tabla}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                        #{idx + 1} {item.tabla}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.servicio}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 mb-3">{item.descripcion}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    <code>{item.ejemplo}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SCRIPT SQL DE MIGRACIÓN & PERMISOS (Admin) */}
        {activeTab === 'sql' && currentUser.rol === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  SQL Editor de Supabase
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  Script de Migración, Permisos GRANT y 11 Cuentas
                </h2>
                <p className="text-xs text-slate-500">
                  Ejecuta este script en el panel de Supabase para otorgar permisos a roles y sembrar usuarios.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-2 shadow-sm transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedSql ? '¡Copiado!' : 'Copiar Script'}
                </button>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
                >
                  Abrir Supabase <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px]">
              <pre className="leading-relaxed">
{`-- ==============================================================================
-- FLASH SERVICES COURIER CARGO - PERMISOS Y SEMILLA DE USUARIOS
-- 1 Administrador, 5 Empleados y 5 Clientes (Contraseña de prueba: 123456)
-- ==============================================================================

-- 1. Asegurar permisos en el esquema public para anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 2. Insertar Personas
INSERT INTO public.persona (id, tipo_documento, numero_documento, nombres, apellidos, razon_social, email, telefono, es_cliente_corporativo)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'DNI', '09887766', 'Carlos Alberto', 'Ramos Morales', NULL, 'admin@flashservices.com', '+51 987 654 321', false),
  ('c0000002-0000-0000-0000-000000000002', 'DNI', '44556677', 'Fernando', 'Mendoza Díaz', NULL, 'fernando.mendoza@flashservices.com', '+51 981 112 233', false),
  ('c0000003-0000-0000-0000-000000000003', 'DNI', '47889900', 'Lucía', 'Torres Vega', NULL, 'lucia.torres@flashservices.com', '+51 982 223 344', false),
  ('c0000004-0000-0000-0000-000000000004', 'DNI', '41223344', 'Javier', 'Robles Campos', NULL, 'javier.robles@flashservices.com', '+51 983 334 455', false),
  ('c0000005-0000-0000-0000-000000000005', 'DNI', '46332211', 'María Elena', 'Fernández Ruiz', NULL, 'maria.fernandez@flashservices.com', '+51 984 445 566', false),
  ('c0000006-0000-0000-0000-000000000006', 'DNI', '49887766', 'Diego Alonso', 'Quispe Mamani', NULL, 'diego.quispe@flashservices.com', '+51 985 556 677', false),
  ('c0000007-0000-0000-0000-000000000007', 'RUC', '20512345671', 'Roberto', 'Gómez Prado', 'Corporación Textil del Perú S.A.C.', 'roberto.gomez@corporaciontextil.com', '+51 971 100 200', true),
  ('c0000008-0000-0000-0000-000000000008', 'RUC', '20609876543', 'Ana Paula', 'Valdivia Castro', 'Droguería & Farmacéutica Andina S.A.', 'ana.valdivia@farmaceutica-andina.pe', '+51 972 200 300', true),
  ('c0000009-0000-0000-0000-000000000009', 'RUC', '20455667788', 'Marcos', 'Herrera Luján', 'Tech Import Perú E.I.R.L.', 'marcos.herrera@techimport.com', '+51 973 300 400', true),
  ('c0000010-0000-0000-0000-000000000010', 'DNI', '47891234', 'Patricia', 'Silva Romero', NULL, 'patricia.silva@gmail.com', '+51 974 400 500', false),
  ('c0000011-0000-0000-0000-000000000011', 'DNI', '42345678', 'Fernando', 'Vargas Cornejo', NULL, 'fernando.vargas@outlook.com', '+51 975 500 600', false)
ON CONFLICT (numero_documento) DO NOTHING;

-- 3. Insertar Usuarios
INSERT INTO public.usuario (persona_id, nombre, apellido, email, telefono, rol, activo)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Carlos Alberto', 'Ramos Morales', 'admin@flashservices.com', '+51 987 654 321', 'admin', true),
  ('c0000002-0000-0000-0000-000000000002', 'Fernando', 'Mendoza Díaz', 'fernando.mendoza@flashservices.com', '+51 981 112 233', 'empleado', true),
  ('c0000003-0000-0000-0000-000000000003', 'Lucía', 'Torres Vega', 'lucia.torres@flashservices.com', '+51 982 223 344', 'empleado', true),
  ('c0000004-0000-0000-0000-000000000004', 'Javier', 'Robles Campos', 'javier.robles@flashservices.com', '+51 983 334 455', 'empleado', true),
  ('c0000005-0000-0000-0000-000000000005', 'María Elena', 'Fernández Ruiz', 'maria.fernandez@flashservices.com', '+51 984 445 566', 'empleado', true),
  ('c0000006-0000-0000-0000-000000000006', 'Diego Alonso', 'Quispe Mamani', 'diego.quispe@flashservices.com', '+51 985 556 677', 'empleado', true),
  ('c0000007-0000-0000-0000-000000000007', 'Roberto', 'Gómez Prado', 'roberto.gomez@corporaciontextil.com', '+51 971 100 200', 'cliente', true),
  ('c0000008-0000-0000-0000-000000000008', 'Ana Paula', 'Valdivia Castro', 'ana.valdivia@farmaceutica-andina.pe', '+51 972 200 300', 'cliente', true),
  ('c0000009-0000-0000-0000-000000000009', 'Marcos', 'Herrera Luján', 'marcos.herrera@techimport.com', '+51 973 300 400', 'cliente', true),
  ('c0000010-0000-0000-0000-000000000010', 'Patricia', 'Silva Romero', 'patricia.silva@gmail.com', '+51 974 400 500', 'cliente', true),
  ('c0000011-0000-0000-0000-000000000011', 'Fernando', 'Vargas Cornejo', 'fernando.vargas@outlook.com', '+51 975 500 600', 'cliente', true)
ON CONFLICT (email) DO NOTHING;`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer Limpio */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Flash Services Courier Cargo &bull; Arquitectura React + Vite + Supabase &bull; Reemplazo integral de Laravel MVC
        </p>
      </footer>

      {passwordAccountId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60">
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Cambiar contraseña</h3>
            {accountError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{accountError}</div>
            )}
            <input
              autoFocus
              required
              minLength={4}
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPasswordAccountId(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Guardar contraseña</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CÓDIGO QR DE SEGUIMIENTO (Con opción de descarga) */}
      <TrackingQrModal
        envio={selectedEnvioForQr}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* MODAL: CREAR NUEVA GUÍA (Genera y abre QR inmediatamente) */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleShipmentCreated}
        currentUser={currentUser}
      />
    </div>
  )
}
