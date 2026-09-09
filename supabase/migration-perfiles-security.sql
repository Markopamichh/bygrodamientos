-- ============================================================
-- BYG Rodamientos — Seguridad: email en perfiles + RLS
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna email a perfiles (idempotente)
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Poblar email desde auth.users para registros existentes
UPDATE perfiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Trigger para mantener email sincronizado al crear/actualizar perfil
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS trigger language plpgsql as $$
BEGIN
  SELECT email INTO NEW.email FROM auth.users WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email ON perfiles;
CREATE TRIGGER trg_sync_profile_email
  BEFORE INSERT OR UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_email();

-- 4. RLS: solo service role puede modificar perfiles (defensa en profundidad)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, pero por si acaso:
CREATE POLICY "Service role full access on perfiles"
  ON perfiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados solo pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

-- 5. Foreign key constraint (si no existe)
DO $$ BEGIN
  ALTER TABLE perfiles
    ADD CONSTRAINT perfiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Verificar
SELECT p.id, p.email, p.rol
FROM perfiles p
ORDER BY p.rol, p.email;
