-- ============================================================
-- BYG Rodamientos — Supabase Schema
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLAS
-- ────────────────────────────────────────────────────────────

create table if not exists categorias (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  slug text unique not null,
  descripcion text,
  descripcion_larga text,
  categoria_id uuid references categorias(id) on delete set null,
  subcategoria text,
  stock integer default 0 check (stock >= 0),
  precio decimal(10,2) check (precio >= 0),
  imagen_url text,
  especificaciones jsonb default '{}'::jsonb,
  aplicaciones text[] default '{}',
  caracteristicas text[] default '{}',
  fabricante text,
  numero_parte text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists login_attempts (
  id uuid default gen_random_uuid() primary key,
  ip_address text,
  attempted_at timestamptz default now()
);

-- Índices para rendimiento
create index if not exists idx_productos_slug on productos(slug);
create index if not exists idx_productos_categoria on productos(categoria_id);
create index if not exists idx_productos_activo on productos(activo);
create index if not exists idx_login_attempts_ip on login_attempts(ip_address, attempted_at);

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
before update on productos
for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

alter table categorias enable row level security;
alter table productos enable row level security;
alter table login_attempts enable row level security;

-- Categorías: lectura pública, escritura solo autenticados
create policy "Lectura pública de categorías"
  on categorias for select
  using (true);

create policy "Solo admin autenticado puede modificar categorías"
  on categorias for all
  using (auth.role() = 'authenticated');

-- Productos: lectura pública (solo activos desde cliente), escritura solo autenticados
create policy "Lectura pública de productos activos"
  on productos for select
  using (true);

create policy "Solo admin autenticado puede modificar productos"
  on productos for insert
  with check (auth.role() = 'authenticated');

create policy "Solo admin autenticado puede actualizar productos"
  on productos for update
  using (auth.role() = 'authenticated');

create policy "Solo admin autenticado puede eliminar productos"
  on productos for delete
  using (auth.role() = 'authenticated');

-- login_attempts: no acceso público directo (solo service role)
-- El service role siempre bypasea RLS

-- ────────────────────────────────────────────────────────────
-- 3. CONFIGURACIÓN DE AUTH (ejecutar en Supabase Dashboard)
-- ────────────────────────────────────────────────────────────
-- Authentication > Settings:
--   - JWT Expiry: 28800 (8 horas)
--   - Enable email confirmations: ON (para nuevos usuarios)
--   - Disable signups: ON (solo el admin puede registrarse vía Dashboard)
