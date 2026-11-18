-- ==============================================================================
-- FLASH SERVICES COURIER CARGO - MIGRACIÓN COMPLETA A SUPABASE (POSTGRESQL)
-- Arquitectura Serverless / BaaS unificada
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Habilitar extensiones requeridas para UUIDs y funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Función genérica para actualización automática de la columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLA 1: PERSONA
-- Clientes particulares, personas jurídicas, remitentes y destinatarios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento VARCHAR(20) DEFAULT 'DNI' NOT NULL, -- DNI, RUC, NIT, PASAPORTE, CI
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    nombres VARCHAR(120),
    apellidos VARCHAR(120),
    razon_social VARCHAR(200),
    email VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Bolivia',
    es_cliente_corporativo BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 2: USUARIO
-- Operadores de agencia, administradores, conductores y personal operativo
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES public.persona(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(50) DEFAULT 'operador' NOT NULL, -- 'admin', 'operador', 'conductor', 'cliente'
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 3: TIPO_SERVICIO
-- Modalidades de envío (Flash Express, Carga Estándar, Same Day, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tipo_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL, -- 'EXPRESS', 'ESTANDAR', 'CARGA_PESADA', etc.
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tiempo_entrega_estimado VARCHAR(100), -- '24 horas', '48-72 horas', 'Mismo día'
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 4: TARIFA
-- Tabulador y matriz de precios por peso y tipo de servicio
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tarifa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_servicio_id UUID NOT NULL REFERENCES public.tipo_servicio(id) ON DELETE CASCADE,
    peso_min NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    peso_max NUMERIC(10,2) NOT NULL,
    precio_base NUMERIC(12,2) NOT NULL,
    precio_kg_adicional NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 5: ENVIO
-- Entidad central del sistema de encomiendas y logística courier
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.envio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    remitente_id UUID NOT NULL REFERENCES public.persona(id) ON DELETE RESTRICT,
    destinatario_id UUID NOT NULL REFERENCES public.persona(id) ON DELETE RESTRICT,
    tipo_servicio_id UUID NOT NULL REFERENCES public.tipo_servicio(id) ON DELETE RESTRICT,
    origen VARCHAR(150) NOT NULL,
    destino VARCHAR(150) NOT NULL,
    direccion_destino TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL, 
    peso_total NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    volumen_total NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    costo_envio NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    observaciones TEXT,
    fecha_envio TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_estimada_entrega TIMESTAMPTZ,
    fecha_entrega_real TIMESTAMPTZ,
    created_by UUID REFERENCES public.usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_envio_estado CHECK (estado IN ('pendiente', 'recolectado', 'en_almacen', 'en_transito', 'en_reparto', 'entregado', 'devuelto', 'retenido'))
);

-- ==============================================================================
-- TABLA 6: DETALLE_PIEZA
-- Paquetes, bultos o piezas individuales que componen un envío
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.detalle_pieza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envio_id UUID NOT NULL REFERENCES public.envio(id) ON DELETE CASCADE,
    numero_pieza INTEGER DEFAULT 1 NOT NULL,
    peso NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    largo NUMERIC(10,2) DEFAULT 0.00,
    ancho NUMERIC(10,2) DEFAULT 0.00,
    alto NUMERIC(10,2) DEFAULT 0.00,
    peso_volumetrico NUMERIC(10,2) DEFAULT 0.00,
    descripcion_contenido TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 7: PRUEBA_ENTREGA
-- Constancia fotográfica y digital de recepción (POD - Proof of Delivery)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prueba_entrega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envio_id UUID NOT NULL REFERENCES public.envio(id) ON DELETE CASCADE,
    receptor_nombre VARCHAR(150) NOT NULL,
    receptor_documento VARCHAR(50),
    ruta_imagen TEXT NOT NULL,
    comentarios TEXT,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    fecha_entrega TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 8: HISTORIAL_MODIFICACION
-- Registro de auditoría, trazabilidad y tracking histórico de eventos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.historial_modificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada VARCHAR(60) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(50) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    modificado_por UUID REFERENCES public.usuario(id) ON DELETE SET NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 9: DETALLE_COBRO_ENVIO
-- Desglose de rubros de cobro por guía (flete, seguro, embalaje, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.detalle_cobro_envio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envio_id UUID NOT NULL REFERENCES public.envio(id) ON DELETE CASCADE,
    concepto VARCHAR(100) NOT NULL,
    monto NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    pagado BOOLEAN DEFAULT false NOT NULL,
    metodo_pago VARCHAR(50),
    comprobante_pago VARCHAR(100),
    fecha_cobro TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 10: DETALLE_MENSUAL_COBRO
-- Liquidaciones mensuales y facturación consolidada para cuentas corporativas
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.detalle_mensual_cobro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.persona(id) ON DELETE RESTRICT,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INTEGER NOT NULL CHECK (anio >= 2020),
    total_envios INTEGER DEFAULT 0 NOT NULL,
    monto_total NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    pagado BOOLEAN DEFAULT false NOT NULL,
    fecha_facturacion TIMESTAMPTZ,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_cliente_periodo UNIQUE(persona_id, mes, anio)
);

-- ==============================================================================
-- TABLA 11: MANIFIESTO_DESPACHO
-- Hoja de ruta y despacho de carga para conductores y vehículos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.manifiesto_despacho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_manifiesto VARCHAR(50) UNIQUE NOT NULL,
    conductor_id UUID REFERENCES public.usuario(id) ON DELETE SET NULL,
    vehiculo_placa VARCHAR(20),
    ruta_origen VARCHAR(150) NOT NULL,
    ruta_destino VARCHAR(150) NOT NULL,
    estado VARCHAR(50) DEFAULT 'preparacion' NOT NULL,
    fecha_salida TIMESTAMPTZ,
    fecha_llegada TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLA 12: MANIFIESTO_ENVIO
-- Relación de envíos asignados a un manifiesto con orden de reparto
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.manifiesto_envio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifiesto_id UUID NOT NULL REFERENCES public.manifiesto_despacho(id) ON DELETE CASCADE,
    envio_id UUID NOT NULL REFERENCES public.envio(id) ON DELETE CASCADE,
    orden_entrega INTEGER DEFAULT 1 NOT NULL,
    estado_entrega VARCHAR(50) DEFAULT 'cargado' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_manifiesto_envio UNIQUE(manifiesto_id, envio_id)
);

-- TRIGGERS, ÍNDICES Y POLÍTICAS INCLUIDOS EN supabase/migrations/20261118000000_flash_services_init.sql


-- ==============================================================================
-- PERMISOS PARA SCHEMA PUBLIC (Acceso anónimo y autenticado)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- SEMILLA: 1 ADMINISTRADOR, 5 EMPLEADOS, 5 CLIENTES (Contraseña: 123456)
-- ==============================================================================
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
