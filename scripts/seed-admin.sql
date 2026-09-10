-- ── Seed: Primer administrador ────────────────────────────────────
-- Ejecutar en el SQL Editor de Supabase (o psql).
-- Reemplazar '<user_id>' con el id del usuario en auth.users
-- Para obtener el id: SELECT id FROM auth.users WHERE email = 'admin@byg.com';
--
-- Si el usuario no existe en auth.users, crealo primero desde el panel
-- de Auth de Supabase o con:
--   SELECT auth.admin.sign_up('admin@byg.com', 'contraseña123');
--

INSERT INTO usuarios (id, rol)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@byg.com'),
  'admin'
)
ON CONFLICT (id) DO UPDATE SET rol = 'admin';

-- ── Verificar ──────────────────────────────────────────────────────
SELECT u.id, au.email, u.rol
FROM usuarios u
JOIN auth.users au ON au.id = u.id;
