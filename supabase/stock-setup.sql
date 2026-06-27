-- ============================================================
-- BYG Rodamientos — Stock Management Setup
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table items enable row level security;
alter table item_codigos_equivalentes enable row level security;
alter table movimientos_stock enable row level security;
alter table usuarios enable row level security;

-- Items: solo usuarios autenticados (sin acceso público)
create policy "items_select_auth" on items
  for select using (auth.role() = 'authenticated');

create policy "items_insert_auth" on items
  for insert with check (auth.role() = 'authenticated');

create policy "items_update_auth" on items
  for update using (auth.role() = 'authenticated');

create policy "items_delete_auth" on items
  for delete using (auth.role() = 'authenticated');

-- Códigos equivalentes: solo autenticados
create policy "codigos_select_auth" on item_codigos_equivalentes
  for select using (auth.role() = 'authenticated');

create policy "codigos_insert_auth" on item_codigos_equivalentes
  for insert with check (auth.role() = 'authenticated');

create policy "codigos_delete_auth" on item_codigos_equivalentes
  for delete using (auth.role() = 'authenticated');

-- Movimientos: solo autenticados, solo lectura/inserción (no update/delete por integridad)
create policy "movimientos_select_auth" on movimientos_stock
  for select using (auth.role() = 'authenticated');

create policy "movimientos_insert_auth" on movimientos_stock
  for insert with check (auth.role() = 'authenticated');

-- Usuarios: solo autenticados
create policy "usuarios_select_auth" on usuarios
  for select using (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 2. RPC: MOVIMIENTO DE STOCK ATÓMICO
-- Actualiza items.stock_actual e inserta en movimientos_stock
-- en una sola transacción con bloqueo de fila (FOR UPDATE).
-- Usar siempre esta función desde el cliente; nunca dos queries separadas.
-- ────────────────────────────────────────────────────────────

create or replace function registrar_movimiento_stock(
  p_item_id    uuid,
  p_tipo       text,
  p_cantidad   integer,
  p_usuario_id uuid,
  p_nota       text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_stock_actual integer;
  v_stock_nuevo  integer;
begin
  select stock_actual
    into v_stock_actual
    from items
   where id = p_item_id
     for update;

  if not found then
    raise exception 'Item no encontrado: %', p_item_id;
  end if;

  v_stock_nuevo := v_stock_actual + p_cantidad;

  if v_stock_nuevo < 0 then
    raise exception 'Stock insuficiente. Actual: %, delta solicitado: %',
      v_stock_actual, p_cantidad;
  end if;

  update items
     set stock_actual = v_stock_nuevo,
         updated_at   = now()
   where id = p_item_id;

  insert into movimientos_stock
    (item_id, tipo, cantidad, stock_resultante, usuario_id, nota)
  values
    (p_item_id, p_tipo, p_cantidad, v_stock_nuevo, p_usuario_id, p_nota);

  return jsonb_build_object('stock_nuevo', v_stock_nuevo);
end;
$$;
