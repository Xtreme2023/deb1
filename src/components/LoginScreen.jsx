import React, { useState } from 'react'
import {
  Truck,
  User,
  Lock,
  ArrowRight
} from 'lucide-react'
import authService from '../services/authService'

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@flashservices.com')
  const [password, setPassword] = useState('123456')
  const [activeRoleTab, setActiveRoleTab] = useState('admin') // 'admin', 'empleado', 'cliente'
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFormLogin = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const result = await authService.login(email, password)
    setLoading(false)

    if (result.success) {
      onLoginSuccess(result.user)
    } else {
      setErrorMsg(result.error)
    }
  }

  const handleQuickLogin = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setErrorMsg(null)
    const user = authService.loginRapido(account.id)
    if (user) {
      onLoginSuccess(user)
    }
  }

  // Filtrar cuentas para las pestañas rápidas
  const cuentasDisponibles = authService.getCuentas().filter((u) => u.activo !== false)
  const adminAccounts = cuentasDisponibles.filter((u) => u.rol === 'admin')
  const empleadoAccounts = cuentasDisponibles.filter((u) => u.rol === 'empleado')
  const clienteAccounts = cuentasDisponibles.filter((u) => u.rol === 'cliente')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
              <Truck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900 uppercase">
                  Flash Services
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  COURIER CARGO
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Portal de Acceso Logístico</p>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 inline-block mb-2">
                Autenticación de Usuarios
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Iniciar Sesión en el Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Acceso exclusivo para roles de <strong>Administrador</strong>, <strong>Empleado</strong> y <strong>Cliente</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Selector de Rol Rápido con 1 Clic */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Acceso Rápido por Rol (1 Clic)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Clave: 123456</span>
              </div>

              {/* Tabs de roles */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setActiveRoleTab('admin')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    activeRoleTab === 'admin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👑 1 Admin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoleTab('empleado')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    activeRoleTab === 'empleado'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👷 5 Empleados
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoleTab('cliente')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    activeRoleTab === 'cliente'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏢 5 Clientes
                </button>
              </div>

              {/* Lista de botones de acceso rápido según tab */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeRoleTab === 'admin' &&
                  adminAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-indigo-50/50 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          CR
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {acc.nombre} {acc.apellido}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{acc.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded transition">
                        Entrar &rarr;
                      </span>
                    </button>
                  ))}

                {activeRoleTab === 'empleado' &&
                  empleadoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-indigo-50/50 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {acc.nombre.charAt(0)}
                          {acc.apellido.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {acc.nombre} {acc.apellido}
                          </div>
                          <div className="text-[10px] text-slate-500">{acc.cargo}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-0.5 rounded transition">
                        Entrar &rarr;
                      </span>
                    </button>
                  ))}

                {activeRoleTab === 'cliente' &&
                  clienteAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-indigo-50/50 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {acc.nombre.charAt(0)}
                          {acc.apellido.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {acc.nombre} {acc.apellido}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {acc.empresa || acc.tipoCliente}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2 py-0.5 rounded transition">
                        Entrar &rarr;
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2">O ingresa manualmente</span>
              </div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@flashservices.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Contraseña de Prueba
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">123456</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          Flash Services Courier Cargo &bull; Sistema Serverless React + Vite + Supabase BaaS
        </p>
      </footer>

    </div>
  )
}
