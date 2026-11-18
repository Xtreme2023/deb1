# ⚡ Flash Services Courier Cargo - Serverless / BaaS Platform

Plataforma logística y sistema de courier reconstruido con una arquitectura **Serverless / BaaS**, migrado desde el backend tradicional de Laravel/PHP a **React (Vite)** en el frontend y **Supabase (PostgreSQL, Auth, Storage)** como backend unificado.

---

## 🚀 Arquitectura y Componentes Principales

```
[ Cliente React (Vite) + Tailwind CSS ]
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
  PostgREST API   Storage API   Auth & Realtime
  (CRUD Tablas)   (Constancias) (Tracking / RLS)
       └─────────────┼─────────────┘
                     ▼
           [ Supabase BaaS ]
     PostgreSQL + Bucket 'constancias'
```

---

## 📁 Estructura del Proyecto

- **`.env.local`**: Configuración de variables de entorno con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **`src/lib/supabaseClient.js`**: Inicialización del cliente unificado de Supabase.
- **`src/services/`**: Capa de servicios asíncronos que reemplaza a los Modelos Eloquent de Laravel:
  1. `usuarioService.js`: Gestión de usuarios, roles (admin, operador, conductor, cliente).
  2. `personaService.js`: Remitentes, destinatarios y clientes corporativos.
  3. `envioService.js`: Entidad central de guías, cálculo de pesos y ciclo de vida de entrega.
  4. `detallePiezaService.js`: Paquetes individuales y peso volumétrico (IATA: `L*A*H / 5000`).
  5. `tipoServicioService.js`: Tipos de servicio (Flash Express, Terrestre, Carga Aérea).
  6. `tarifaService.js`: Tabuladores de tarifas según rango de peso.
  7. `pruebaEntregaService.js`: Constancias de entrega (POD), fotos y georreferenciación GPS.
  8. `historialModificacionService.js`: Registro de auditoría y trazabilidad histórica.
  9. `detalleCobroEnvioService.js`: Desglose de rubros (flete, seguro, embalaje) y pagos.
  10. `detalleMensualCobroService.js`: Liquidaciones mensuales para cuentas corrientes corporativas.
  11. `manifiestoDespachoService.js`: Hojas de ruta para conductores y asignación de vehículos.
  12. `manifiestoEnvioService.js`: Relación con secuencia ordenada de entrega por despacho.
- **`CUENTAS_DE_PRUEBA.md`**: Credenciales oficiales de prueba para **1 Administrador**, **5 Empleados** y **5 Clientes** (Contraseña universal: `123456`).
- **`src/components/LoginScreen.jsx`**: Pantalla de inicio de sesión con roles (Administrador, Empleado, Cliente) y acceso rápido de 1 clic.
- **`src/components/TrackingQrModal.jsx`**: Generación dinámica y descarga de códigos QR para seguimiento de paquetes e impresión de rótulos de despacho.
- **`src/components/CreateShipmentModal.jsx`**: Formulario de creación de guías con generación automática inmediata de código QR.
- **`src/components/UploadProofOfDelivery.jsx`**: Componente interactivo y elegante para la captura de fotografías, subida al bucket `constancias` de Supabase Storage, obtención de URL pública y registro en `prueba_entrega`.
- **`supabase/migrations/20261118000000_flash_services_init.sql`**: Script SQL completo y compatible con PostgreSQL nativo para las 12 tablas, llaves foráneas, índices, triggers, bucket y políticas RLS.

---

## 🛠️ Instrucciones de Puesta en Marcha

### 1. Variables de Entorno
Edita el archivo `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu-clave-publica
```

### 2. Ejecutar la Migración en Supabase
1. Ingresa a [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto y dirígete a **SQL Editor**.
3. Abre el archivo `supabase/migrations/20261118000000_flash_services_init.sql` (o cópialo desde la pestaña correspondiente en la aplicación web).
4. Haz clic en **Run**. Esto creará:
   - Las 12 tablas relacionales con sus `FOREIGN KEY` y tipos nativos `UUID` y `TIMESTAMPTZ`.
   - Índices de alto rendimiento en campos clave (`numero_guia`, `estado`, etc.).
   - Triggers automáticos para `updated_at`.
   - El bucket de almacenamiento `constancias` en Supabase Storage con políticas públicas de lectura y subida.
   - Políticas de seguridad Row Level Security (RLS).
   - Datos semilla para tipos de servicios.

### 3. Ejecutar el Entorno de Desarrollo
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:5173`.
