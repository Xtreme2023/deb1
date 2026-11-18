import { supabase } from '../lib/supabaseClient'

/**
 * Cuentas oficiales de prueba requeridas:
 * 1 Administrador, 5 Empleados y 5 Clientes.
 * Contraseña común para todas: '123456'
 */
export const CUENTAS_PREDEFINIDAS = [
  // --- 1 ADMINISTRADOR ---
  {
    id: 'usr-admin-01',
    email: 'admin@flashservices.com',
    password: '123456',
    nombre: 'Carlos Alberto',
    apellido: 'Ramos Morales',
    rol: 'admin',
    rolEtiqueta: 'Administrador General',
    cargo: 'Director de Operaciones y Tecnología',
    departamento: 'Dirección General',
    documento: '09887766',
    telefono: '+51 987 654 321',
    avatarColor: 'from-blue-600 to-indigo-600',
  },

  // --- 5 EMPLEADOS ---
  {
    id: 'usr-emp-01',
    email: 'fernando.mendoza@flashservices.com',
    password: '123456',
    nombre: 'Fernando',
    apellido: 'Mendoza Díaz',
    rol: 'empleado',
    rolEtiqueta: 'Empleado - Despacho',
    cargo: 'Jefe de Operaciones y Almacén Central',
    departamento: 'Logística y Despacho',
    documento: '44556677',
    telefono: '+51 981 112 233',
    avatarColor: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'usr-emp-02',
    email: 'lucia.torres@flashservices.com',
    password: '123456',
    nombre: 'Lucía',
    apellido: 'Torres Vega',
    rol: 'empleado',
    rolEtiqueta: 'Empleada - Admisión',
    cargo: 'Coordinadora de Guías y Atención al Cliente',
    departamento: 'Admisión y Atención',
    documento: '47889900',
    telefono: '+51 982 223 344',
    avatarColor: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'usr-emp-03',
    email: 'javier.robles@flashservices.com',
    password: '123456',
    nombre: 'Javier',
    apellido: 'Robles Campos',
    rol: 'empleado',
    rolEtiqueta: 'Empleado - Control',
    cargo: 'Agente de Clasificación y Paquetería Aérea',
    departamento: 'Terminal Aéreo Cargo',
    documento: '41223344',
    telefono: '+51 983 334 455',
    avatarColor: 'from-teal-600 to-emerald-600',
  },
  {
    id: 'usr-emp-04',
    email: 'maria.fernandez@flashservices.com',
    password: '123456',
    nombre: 'María Elena',
    apellido: 'Fernández Ruiz',
    rol: 'empleado',
    rolEtiqueta: 'Empleada - Conductora',
    cargo: 'Conductora de Reparto (Ruta Cochabamba Norte)',
    departamento: 'Flota Terrestre',
    documento: '46332211',
    telefono: '+51 984 445 566',
    avatarColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'usr-emp-05',
    email: 'diego.quispe@flashservices.com',
    password: '123456',
    nombre: 'Diego Alonso',
    apellido: 'Quispe Mamani',
    rol: 'empleado',
    rolEtiqueta: 'Empleado - Conductor',
    cargo: 'Conductor de Reparto (Ruta Cochabamba Sur y Centro)',
    departamento: 'Flota Terrestre',
    documento: '49887766',
    telefono: '+51 985 556 677',
    avatarColor: 'from-blue-600 to-teal-600',
  },

  // --- 5 CLIENTES ---
  {
    id: 'usr-cli-01',
    email: 'roberto.gomez@corporaciontextil.com',
    password: '123456',
    nombre: 'Roberto',
    apellido: 'Gómez Prado',
    empresa: 'Corporación Textil del Perú S.A.C.',
    rol: 'cliente',
    rolEtiqueta: 'Cliente Corporativo',
    tipoCliente: 'Corporativo (RUC)',
    documento: '20512345671',
    telefono: '+51 971 100 200',
    avatarColor: 'from-violet-600 to-pink-600',
  },
  {
    id: 'usr-cli-02',
    email: 'ana.valdivia@farmaceutica-andina.pe',
    password: '123456',
    nombre: 'Ana Paula',
    apellido: 'Valdivia Castro',
    empresa: 'Droguería & Farmacéutica Andina S.A.',
    rol: 'cliente',
    rolEtiqueta: 'Cliente Corporativo',
    tipoCliente: 'Corporativo (RUC)',
    documento: '20609876543',
    telefono: '+51 972 200 300',
    avatarColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'usr-cli-03',
    email: 'marcos.herrera@techimport.com',
    password: '123456',
    nombre: 'Marcos',
    apellido: 'Herrera Luján',
    empresa: 'Tech Import Perú E.I.R.L.',
    rol: 'cliente',
    rolEtiqueta: 'Cliente Corporativo',
    tipoCliente: 'Corporativo (RUC)',
    documento: '20455667788',
    telefono: '+51 973 300 400',
    avatarColor: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'usr-cli-04',
    email: 'patricia.silva@gmail.com',
    password: '123456',
    nombre: 'Patricia',
    apellido: 'Silva Romero',
    empresa: null,
    rol: 'cliente',
    rolEtiqueta: 'Cliente Particular',
    tipoCliente: 'Persona Natural (DNI)',
    documento: '47891234',
    telefono: '+51 974 400 500',
    avatarColor: 'from-rose-600 to-pink-600',
  },
  {
    id: 'usr-cli-05',
    email: 'fernando.vargas@outlook.com',
    password: '123456',
    nombre: 'Fernando',
    apellido: 'Vargas Cornejo',
    empresa: null,
    rol: 'cliente',
    rolEtiqueta: 'Cliente Particular',
    tipoCliente: 'Persona Natural (DNI)',
    documento: '42345678',
    telefono: '+51 975 500 600',
    avatarColor: 'from-amber-600 to-yellow-600',
  },
]

const SESSION_STORAGE_KEY = 'flash_courier_active_user'
const ACCOUNTS_STORAGE_KEY = 'flash_courier_managed_accounts'

const getManagedAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveManagedAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

export const authService = {
  getCuentas() {
    const managed = getManagedAccounts()
    const managedById = new Map(managed.map((account) => [account.id, account]))
    return CUENTAS_PREDEFINIDAS
      .filter((account) => !managedById.get(account.id)?.eliminada)
      .map((account) => managedById.get(account.id) ? { ...account, ...managedById.get(account.id) } : account)
      .concat(managed.filter((account) => !account.eliminada && !CUENTAS_PREDEFINIDAS.some((base) => base.id === account.id)))
  },

  getCuentaById(id) {
    return this.getCuentas().find((account) => account.id === id) || null
  },

  createCuenta(datos) {
    const cleanEmail = datos.email.trim().toLowerCase()
    if (this.getCuentas().some((account) => account.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Ya existe una cuenta con este correo.' }
    }

    const nuevoId = `usr-${Date.now().toString(36)}`
    const cuenta = {
      id: nuevoId,
      email: cleanEmail,
      password: datos.password?.trim() || '123456',
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      empresa: datos.empresa?.trim() || null,
      rol: datos.rol === 'empleado' ? 'empleado' : 'cliente',
      rolEtiqueta: datos.rol === 'empleado' ? 'Empleado' : 'Cliente',
      tipoCliente: datos.rol === 'cliente' ? 'Cliente Registrado' : null,
      cargo: datos.cargo?.trim() || null,
      documento: datos.documento?.trim() || '',
      telefono: datos.telefono?.trim() || '',
      avatarColor: datos.rol === 'empleado' ? 'from-blue-600 to-cyan-600' : 'from-emerald-600 to-teal-600',
      activo: true,
    }

    const managed = getManagedAccounts()
    saveManagedAccounts([...managed.filter((account) => account.id !== nuevoId), cuenta])
    return { success: true, user: cuenta }
  },

  updateCuenta(id, updates) {
    const base = this.getCuentaById(id)
    if (!base) return { success: false, error: 'Cuenta no encontrada.' }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase()
      if (this.getCuentas().some((account) => account.id !== id && account.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'Ya existe una cuenta con este correo.' }
      }
      updates.email = cleanEmail
    }

    const account = { ...base, ...updates, updatedAt: new Date().toISOString() }
    const managed = getManagedAccounts().filter((item) => item.id !== id)
    saveManagedAccounts([...managed, account])
    return { success: true, user: account }
  },

  deleteCuenta(id) {
    const base = this.getCuentaById(id)
    if (!base) return { success: false, error: 'Cuenta no encontrada.' }
    if (base.rol === 'admin') return { success: false, error: 'No puedes eliminar al administrador.' }

    const managed = getManagedAccounts().filter((item) => item.id !== id)
    saveManagedAccounts([...managed, { ...base, eliminada: true, activo: false }])
    return { success: true }
  },

  /**
   * Obtiene la lista completa de las 11 cuentas predefinidas
   */
  getCuentasPredefinidas() {
    return this.getCuentas()
  },

  /**
   * Obtiene las cuentas filtradas por rol ('admin', 'empleado', 'cliente')
   */
  getCuentasPorRol(rol) {
    if (!rol) return this.getCuentas()
    return this.getCuentas().filter((u) => u.rol === rol)
  },

  /**
   * Inicia sesión por email y contraseña ('123456')
   */
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    // 1. Intentar validar contra la lista de cuentas autorizadas
    const user = this.getCuentas().find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword && u.activo !== false
    )

    if (user) {
      // Guardar en sesión
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))

      // Sincronizar en segundo plano con Supabase si está disponible
      try {
        if (supabase) {
          // Si el usuario existe en la tabla de Supabase o se necesita registrar
          supabase
            .from('usuario')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle()
            .then(({ data }) => {
              if (!data) {
                // Registrar silenciosamente si no existe
                supabase.from('usuario').insert([
                  {
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    telefono: user.telefono,
                    rol: user.rol,
                    activo: true,
                  },
                ]).then(() => {}).catch(() => {})
              }
            })
            .catch(() => {})
        }
      } catch (err) {
        console.warn('Sync con Supabase no bloqueante:', err)
      }

      return { success: true, user }
    }

    // Si no coincide contraseña
    return {
      success: false,
      error: 'Credenciales inválidas. Usa una de las cuentas autorizadas con contraseña: 123456',
    }
  },

  /**
   * Cierra la sesión activa
   */
  logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  },

  /**
   * Obtiene el usuario autenticado actualmente
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    // Por defecto retornar el admin para desarrollo rápido si no hay sesión
    return null
  },

  /**
   * Iniciar sesión rápido con una cuenta de muestra
   */
  loginRapido(userId) {
    const user = this.getCuentas().find((u) => u.id === userId)
    if (user && user.activo !== false) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
      return user
    }
    return null
  },

  changePassword(id, nuevaPassword) {
    const password = nuevaPassword?.trim()
    if (!password || password.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' }
    }
    const result = this.updateCuenta(id, { password })
    if (!result.success) return result

    const stored = this.getCurrentUser()
    if (stored?.id === id) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.user))
    }
    return { success: true }
  },
}

export default authService
