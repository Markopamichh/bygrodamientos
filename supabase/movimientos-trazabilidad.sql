-- ────────────────────────────────────────────────────────────
-- Trazabilidad de movimientos de stock
-- Agrega proveedor, cliente, factura y precio a cada movimiento
-- para poder responder: ¿a quién le compramos / vendimos este ítem,
-- cuándo, con qué factura y a qué precio?
--
-- Correr una sola vez en el editor SQL de Supabase. Es idempotente.
-- ────────────────────────────────────────────────────────────

-- 1. Nuevas columnas en movimientos_stock
alter table movimientos_stock
  add column if not exists proveedor_id    uuid references proveedores(id),
  add column if not exists cliente_nombre  text,
  add column if not exists factura         text,
  add column if not exists precio_unitario numeric;

-- 2. RPC ampliada (mantiene compatibilidad: los parámetros nuevos son opcionales)
create or replace function registrar_movimiento_stock(
  p_item_id         uuid,
  p_tipo            text,
  p_cantidad        integer,
  p_usuario_id      uuid,
  p_nota            text    default null,
  p_proveedor_id    uuid    default null,
  p_cliente_nombre  text    default null,
  p_factura         text    default null,
  p_precio_unitario numeric default null
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
    (item_id, tipo, cantidad, stock_resultante, usuario_id, nota,
     proveedor_id, cliente_nombre, factura, precio_unitario)
  values
    (p_item_id, p_tipo, p_cantidad, v_stock_nuevo, p_usuario_id, p_nota,
     p_proveedor_id, p_cliente_nombre, p_factura, p_precio_unitario);

  return jsonb_build_object('stock_nuevo', v_stock_nuevo);
end;
$$;

-- 3. Índices para consultar el historial por ítem y por proveedor
create index if not exists movimientos_item_fecha_idx
  on movimientos_stock (item_id, created_at desc);
create index if not exists movimientos_proveedor_idx
  on movimientos_stock (proveedor_id);
