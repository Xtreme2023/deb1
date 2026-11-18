# 📦 Flash Services Courier Cargo — Credenciales y Cuentas de Prueba

Bienvenido a **Flash Services Courier Cargo**. Este documento detalla las credenciales de prueba preconfiguradas para los **3 roles del sistema**: **Administrador**, **Empleado** y **Cliente**.

> **🔑 Contraseña universal de prueba para todas las cuentas:** `123456`

---

## 👑 1. Administrador (1 Cuenta)
Tiene control total del sistema: métricas ejecutivas, monitor global de despachos, creación de guías con código QR, descarga de rótulos, auditoría y panel de servicios Supabase.

| # | Nombre Completo | Correo Electrónico | Contraseña | Rol | Cargo / Departamento |
|---|-----------------|--------------------|------------|-----|----------------------|
| 1 | **Carlos Alberto Ramos Morales** | `admin@flashservices.com` | `123456` | `admin` | Director General de Operaciones y Tecnología |

---

## 👷 2. Empleados de Logística y Despacho (5 Cuentas)
Acceso al módulo operativo: registro rápido de nuevas guías, generación instantánea de código QR para seguimiento, descarga de rótulos de despacho, certificación fotográfica de entrega (POD) con GPS y actualización de estados en ruta.

| # | Nombre Completo | Correo Electrónico | Contraseña | Rol | Especialidad / Ruta |
|---|-----------------|--------------------|------------|-----|---------------------|
| 1 | **Fernando Mendoza Díaz** | `fernando.mendoza@flashservices.com` | `123456` | `empleado` | Jefe de Operaciones & Almacén Central |
| 2 | **Lucía Torres Vega** | `lucia.torres@flashservices.com` | `123456` | `empleado` | Coordinadora de Admisión & Atención al Cliente |
| 3 | **Javier Robles Campos** | `javier.robles@flashservices.com` | `123456` | `empleado` | Agente de Clasificación & Paquetería Aérea |
| 4 | **María Elena Fernández Ruiz** | `maria.fernandez@flashservices.com` | `123456` | `empleado` | Conductora de Reparto (Ruta Cochabamba Norte) |
| 5 | **Diego Alonso Quispe Mamani** | `diego.quispe@flashservices.com` | `123456` | `empleado` | Conductor de Reparto (Ruta Cochabamba Sur y Centro) |

---

## 🏢 3. Clientes (5 Cuentas: 3 Corporativos y 2 Particulares)
Acceso a su portal personalizado: historial de paquetes propios, rastreo en vivo de envíos activos, visualización de comprobantes fotográficos de entrega (POD) y descarga de código QR para cada guía.

| # | Nombre / Razón Social | Correo Electrónico | Contraseña | Rol | Tipo de Cliente / Documento |
|---|-----------------------|--------------------|------------|-----|------------------------------|
| 1 | **Roberto Gómez Prado**<br>*(Corp. Textil del Perú S.A.C.)* | `roberto.gomez@corporaciontextil.com` | `123456` | `cliente` | Corporativo — RUC: `20512345671` |
| 2 | **Ana Paula Valdivia Castro**<br>*(Droguería & Farmacéutica Andina)* | `ana.valdivia@farmaceutica-andina.pe` | `123456` | `cliente` | Corporativo — RUC: `20609876543` |
| 3 | **Marcos Herrera Luján**<br>*(Tech Import Perú E.I.R.L.)* | `marcos.herrera@techimport.com` | `123456` | `cliente` | Corporativo — RUC: `20455667788` |
| 4 | **Patricia Silva Romero** | `patricia.silva@gmail.com` | `123456` | `cliente` | Particular — DNI: `47891234` |
| 5 | **Fernando Vargas Cornejo** | `fernando.vargas@outlook.com` | `123456` | `cliente` | Particular — DNI: `42345678` |

---

## 🚀 Funcionalidades Implementadas

### 1. Pantalla de Inicio de Sesión (Login Screen)
- Pantalla dedicada con selector de roles y **Acceso Rápido con 1 Clic** para probar cualquiera de las 11 cuentas sin tener que escribir.
- Formulario de autenticación estándar por correo y contraseña (`123456`).
- Buscador rápido de guía para clientes que deseen rastrear sin iniciar sesión.

### 2. Generación y Descarga de Código QR de Seguimiento
- **Al crear una nueva guía:** el sistema genera el código de guía único (ej. `FS-98241-EXP`) y crea inmediatamente su código QR scannable con la información completa.
- **En guías existentes:** botón **"Ver / Descargar QR"** en cada envío.
- **Opciones de descarga:**
  - 📥 **Descargar QR (PNG de alta resolución)** para imprimir o adjuntar al paquete.
  - 🖨️ **Imprimir Rótulo de Despacho (Shipping Label)** con código QR, origen, destino, piezas y código de barras.
  - 📋 **Copiar Enlace de Rastreo**.

### 3. Rediseño Visual Limpio y Elegante
- Paleta ejecutiva moderna: fondo blanco nítido y slate suave (`#f8fafc`), acentos en Azul Marino Ejecutivo (`#0f172a`), Azul Real (`#2563eb`), Esmeralda (`#10b981`) y Ámbar (`#f59e0b`).
- Tipografía legible de alto contraste, tarjetas refinadas con sombras suaves y estados de entrega claros.
- Selector de tema (Modo Luminoso Ejecutivo y Modo Noche Sofisticado).

---

## 🗄️ Script SQL Opcional para Sembrar en Supabase

Si deseas sembrar estas 11 cuentas directamente en las tablas `public.persona` y `public.usuario` de tu base de datos Supabase, ejecuta el siguiente script en **Supabase Dashboard -> SQL Editor**:

```sql
-- 1. Asegurar permisos de acceso a las tablas para el rol anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

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
ON CONFLICT (email) DO NOTHING;
```
