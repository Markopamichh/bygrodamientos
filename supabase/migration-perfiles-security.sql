-- ============================================================
-- BYG Rodamientos — Seguridad: email en usuarios + RLS
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna email a usuarios (idempotente)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email text;

-- 2. Poblar email desde auth.users para registros existentes
UPDATE usuarios u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND u.email IS NULL;

-- 3. Trigger para mantener email sincronizado al crear/actualizar usuario
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS trigger language plpgsql as $$
BEGIN
  SELECT email INTO NEW.email FROM auth.users WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email ON usuarios;
CREATE TRIGGER trg_sync_profile_email
  BEFORE INSERT OR UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION sync_profile_email();

-- 4. RLS: solo service role puede modificar usuarios (defensa en profundidad)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, pero por si acaso:
CREATE POLICY "Service role full access on usuarios"
  ON usuarios FOR ALL
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados solo pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- 5. Foreign key constraint (si no existe)
DO $$ BEGIN
  ALTER TABLE usuarios
    ADD CONSTRAINT usuarios_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Verificar
SELECT u.id, u.email, u.rol
FROM usuarios u
ORDER BY u.rol, u.email;
