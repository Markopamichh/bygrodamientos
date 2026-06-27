-- =============================================================
-- MIGRACIÓN: Integrar catálogo MR Accesorios Industriales
-- Proyecto: BYGrodamientos (zituwbdogothhmsudgcr)
-- REVISAR ANTES DE APLICAR — no tocar en producción sin confirmación
-- =============================================================

-- 1. Tabla proveedores
-- =============================================================
create table if not exists proveedores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  sitio_web  text,
  created_at timestamptz default now()
);

insert into proveedores (nombre, sitio_web, telefono, email)
values (
  'MR Accesorios Industriales',
  'https://mraccesoriosindustriales.com.ar',
  '+541130302894',
  'ventas@mraccesoriosindustriales.com'
);


-- 2. Extender tabla productos
-- =============================================================

-- tipo_disponibilidad: 'stock' (default, no rompe los 37 existentes)
--                      'encargo' (productos de MR sin stock físico)
alter table productos
  add column if not exists tipo_disponibilidad text
    not null default 'stock'
    check (tipo_disponibilidad in ('stock', 'encargo'));

-- proveedor_id: null para productos propios de BYG
alter table productos
  add column if not exists proveedor_id uuid references proveedores(id);

-- url_referencia_proveedor: link al producto en el sitio del proveedor
alter table productos
  add column if not exists url_referencia_proveedor text;


-- 3. Tabla solicitudes_encargo (tracking de demanda)
-- =============================================================
create table if not exists solicitudes_encargo (
  id               uuid primary key default gen_random_uuid(),
  producto_id      uuid references productos(id) not null,
  item_id          uuid references items(id),          -- null hasta definir SKU exacto
  cliente_nombre   text,
  cliente_telefono text,
  detalle_pedido   text,
  cantidad         int not null default 1,
  estado           text not null default 'pendiente'
    check (estado in ('pendiente','cotizado','confirmado','comprado','entregado','cancelado')),
  fecha_solicitud  timestamptz default now(),
  usuario_id       uuid references usuarios(id),
  notas            text
);

create index if not exists idx_solicitudes_producto on solicitudes_encargo(producto_id);
create index if not exists idx_solicitudes_estado   on solicitudes_encargo(estado);

-- Índice adicional útil: productos por encargo más solicitados
create index if not exists idx_solicitudes_fecha on solicitudes_encargo(fecha_solicitud desc);


-- =============================================================
-- VERIFICACIÓN post-migración (correr después de aplicar):
-- =============================================================
-- select count(*) from proveedores;                    -- debe ser 1
-- select count(*) from productos where tipo_disponibilidad = 'stock';  -- debe ser 37
-- select count(*) from productos where tipo_disponibilidad = 'encargo'; -- debe ser 0 (aún)
-- \d solicitudes_encargo
