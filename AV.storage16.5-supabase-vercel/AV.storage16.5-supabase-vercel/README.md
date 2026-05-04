# AV.Storage v16.5 — Supabase + Vercel

Versão migrada para uma arquitetura simples, barata e sem dependência de Cloudflare D1, Wrangler ou Pages Functions.

## O que mudou

- Frontend preservado em `dist/index.html` e `dist/app_script.js`.
- API Cloudflare substituída por `dist/supabase_adapter.js`.
- Banco principal migrado para Supabase/Postgres.
- Login ADM feito via Supabase Auth.
- Acesso rápido continua em leitura, usando anon key + RLS.
- Seleção obrigatória de colaborador após login privilegiado, sem input livre de nome.
- Deploy preparado para Vercel com `vercel.json`.

## Estrutura principal

```text
dist/
  index.html
  app_script.js
  config.js
  supabase_adapter.js
supabase/
  01_schema.sql
  02_seed_from_defaults.sql
  03_rls_policies.sql
  04_link_admin_auth_user.sql
docs/
  MIGRATION_SUPABASE.md
  ROLLBACK.md
.env.example
vercel.json
package.json
```

## Configuração rápida

1. Crie um projeto no Supabase.
2. Em Authentication > Users, crie o usuário ADM por e-mail e senha.
3. Rode `supabase/01_schema.sql` no SQL Editor.
4. Rode `supabase/02_seed_from_defaults.sql` e troque `TROQUE_PELO_EMAIL_DO_ADMIN` antes de executar.
5. Rode `supabase/04_link_admin_auth_user.sql` com os UUIDs reais dos usuários `admin` e `dev.gui` criados no Auth.
6. Rode `supabase/03_rls_policies.sql`.
7. Edite `dist/config.js`:

```js
window.AV_STORAGE_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_ANON_PUBLIC_KEY",
  adminEmail: "admin@seudominio.com",
  developerEmail: "dev.gui@seudominio.com",
  sessionCollaborators: ["Evandro", "Lucas", "Guilherme", "Marcos"]
};
```

8. Publique na Vercel apontando para a pasta `dist`.

## Rodar localmente

```bash
npm install
npm run preview
```

Ou simplesmente abra `dist/index.html` com um servidor estático.

## Observações importantes

- Não use `service_role` no frontend.
- O primeiro deploy não usa Realtime para evitar custo e complexidade.
- A sincronização inicial usa leitura/refetch após mutações e polling compatível com o frontend existente.
- Para produção, configure as chaves públicas do Supabase na Vercel ou em `dist/config.js` antes do deploy.

## Guias adicionais

- `docs/MIGRATION_SUPABASE.md`: diagnóstico, arquitetura, deploy e checklist.
- `docs/ROLLBACK.md`: caminho de retorno caso a migração apresente problema.
- `docs/COLLABORATOR_LOGIN.md`: fluxo de login por colaborador.
