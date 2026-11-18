-- ==============================================================================
-- FLASH SERVICES COURIER CARGO - PERMISOS Y SEMILLA DE USUARIOS
-- 1 Administrador, 5 Empleados y 5 Clientes (Contraseña de prueba: 123456)
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Asegurar permisos en el esquema public para anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Insertar Personas (Remitentes, Empleados y Clientes)
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

-- 3. Insertar Usuarios Operativos y Clientes
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

-- Verificación
SELECT rol, count(*) FROM public.usuario GROUP BY rol;
