-- AV.Storage v16.5 — vincular usuários do Supabase Auth aos perfis privilegiados
-- 1) Crie os usuários em Authentication > Users.
-- 2) Use os logins do sistema como aliases no front:
--    - admin    -> e-mail configurado em dist/config.js como adminEmail
--    - dev.gui  -> e-mail configurado em dist/config.js como developerEmail
-- 3) Copie o UUID de cada usuário do Auth.
-- 4) Substitua os valores abaixo e execute.

update public.profiles
set
  auth_user_id = 'COLE_AQUI_O_UUID_DO_AUTH_ADMIN'::uuid,
  email = 'admin@seudominio.com',
  role = 'Administrador',
  status = 'active',
  is_system = true,
  is_guest = false,
  updated_at = now()
where id = 'admin';

update public.profiles
set
  auth_user_id = 'COLE_AQUI_O_UUID_DO_AUTH_DEV'::uuid,
  email = 'dev.gui@seudominio.com',
  role = 'Desenvolvedor',
  status = 'active',
  is_system = true,
  is_guest = false,
  updated_at = now()
where id = 'dev.gui';

select id, auth_user_id, name, email, role, status
from public.profiles
where id in ('admin', 'dev.gui')
order by id;
