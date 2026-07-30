-- ────────────────────────────────────────────────────────────
-- Eliminar un movimiento revirtiendo su efecto en el stock.
-- Un movimiento sumó/restó `cantidad` al stock del ítem; al borrarlo
-- se aplica el delta inverso, todo en una transacción con bloqueo.
--
-- Correr una sola vez en el editor SQL de Supabase. Idempotente.
-- ────────────────────────────────────────────────────────────

create or replace function eliminar_movimiento_stock(
  p_mov_id     uuid,
  p_usuario_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_item_id      uuid;
  v_cantidad     integer;
  v_stock_actual integer;
  v_stock_nuevo  integer;
begin
  -- Traer el movimiento
  select item_id, cantidad
    into v_item_id, v_cantidad
    from movimientos_stock
   where id = p_mov_id;

  if not found then
    raise exception 'Movimiento no encontrado: %', p_mov_id;
  end if;

  -- Bloquear el ítem y revertir el delta
  select stock_actual
    into v_stock_actual
    from items
   where id = v_item_id
     for update;

  v_stock_nuevo := v_stock_actual - v_cantidad;

  if v_stock_nuevo < 0 then
    raise exception 'No se puede eliminar: dejaría el stock negativo (actual %, movimiento %)',
      v_stock_actual, v_cantidad;
  end if;

  update items
     set stock_actual = v_stock_nuevo,
         updated_at   = now()
   where id = v_item_id;

  delete from movimientos_stock where id = p_mov_id;

  return jsonb_build_object('stock_nuevo', v_stock_nuevo);
end;
$$;
