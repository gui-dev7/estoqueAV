# Migração AV.Storage v16.5 — Cloudflare D1 para Supabase

## 1. Diagnóstico da base atual

A versão recebida estava estruturada com frontend estático e backend Cloudflare:

- `dist/index.html`: interface principal.
- `dist/app_script.js`: lógica visual, estado local, login, inventário, infraestrutura, compras e logs.
- `src/app.js`: API server-side usada no Cloudflare Pages Functions.
- `functions/api/[[path]].js`: entrada de rota para Pages Functions.
- `schema.sql`: tabelas D1 antigas (`users`, `app_state`, `sync_meta`, `change_events`).
- `wrangler.toml`: binding D1 e deploy Cloudflare.
- `.wrangler/` e `node_modules/`: resíduos locais de execução/build.

O front dependia de chamadas `/api/*`. Para preservar a interface e reduzir retrabalho, a migração manteve essas chamadas e criou uma camada de compatibilidade em `dist/supabase_adapter.js`, interceptando `/api/*` e executando operações no Supabase.

## 2. Dependências Cloudflare removidas

Removido da entrega final:

- `wrangler.toml`
- `.wrangler/`
- `functions/`
- `realtime-worker/`
- backend `src/app.js`
- script de deploy Cloudflare
- `_redirects` Cloudflare
- `node_modules/`
- dependência `wrangler`

Mantido:

- `dist/index.html`
- `dist/app_script.js`
- `src/defaults.js` apenas como referência dos dados iniciais

## 3. Arquitetura proposta

```text
Usuário
  ↓
Frontend estático na Vercel
  ↓
dist/supabase_adapter.js
  ↓
Supabase Auth + Supabase Postgres + RLS
```

A solução evita backend intermediário no primeiro deploy. Isso reduz custo, pontos de falha e manutenção.

## 4. Modelagem do banco

A modelagem principal agora é normalizada:

- `profiles`: usuários/perfis e vínculo com Supabase Auth.
- `inventory_items`: itens do estoque.
- `inventory_movements`: entradas e saídas.
- `activity_logs`: histórico e auditoria.
- `infra_rooms`: salas e estado dos equipamentos.
- `system_settings`: configurações globais em JSON.
- `sync_meta`: revisão global simples.
- `change_events`: eventos usados pelo polling atual do frontend.

Arquivos:

- `supabase/01_schema.sql`
- `supabase/02_seed_from_defaults.sql`
- `supabase/03_rls_policies.sql`
- `supabase/04_link_admin_auth_user.sql`

## 5. Auth e permissões

### Acesso rápido

- Não usa login real.
- Usa a anon key do Supabase.
- Só consegue ler dados liberados por RLS.
- Não consegue inserir, editar ou excluir.

### ADM

- Login continua visualmente como `admin`.
- Internamente, o adaptador autentica no Supabase Auth usando o e-mail configurado em `dist/config.js`.
- Após login privilegiado, o sistema pede seleção de colaborador em uma lista fechada.
- Esse nome é usado em movimentações e logs.

### RLS

RLS foi aplicado para:

- liberar leitura para `anon` e `authenticated` nas tabelas operacionais;
- permitir escrita apenas para usuários autenticados cujo perfil vinculado esteja com `role = 'Administrador'` e `status = 'active'`.

## 6. Plano de migração por etapas

### Fase 1 — Funcionalidade mínima estável

1. Criar projeto Supabase.
2. Criar usuário ADM no Supabase Auth.
3. Aplicar schema.
4. Aplicar carga inicial.
5. Vincular perfil `admin` ao Auth user.
6. Aplicar RLS.
7. Configurar `dist/config.js`.
8. Fazer deploy na Vercel.
9. Validar login, acesso rápido, inventário, movimentações e infraestrutura.

### Fase 2 — Polimento

1. Melhorar controle de concorrência por item.
2. Adicionar versionamento mais rigoroso por item.
3. Considerar Supabase Realtime apenas se o polling não for suficiente.
4. Criar tela de diagnóstico de conexão.
5. Melhorar importação/exportação.

## 7. Alterações feitas no frontend

### Arquivos adicionados

- `dist/config.js`
- `dist/supabase_adapter.js`

### Arquivo alterado

- `dist/index.html`

Foram adicionados estes scripts antes de `app_script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="./config.js"></script>
<script src="./supabase_adapter.js"></script>
<script src="./app_script.js"></script>
```

### Estratégia usada

O `app_script.js` foi preservado. Em vez de reescrever todos os módulos, o adaptador intercepta `fetch('/api/...')` e responde com o mesmo formato que o backend Cloudflare antigo entregava.

## 8. Limpeza de código legado

A entrega final não depende mais de:

- D1;
- Wrangler;
- Cloudflare Pages Functions;
- Durable Object;
- Worker realtime;
- backend customizado em Cloudflare.

## 9. Sequência exata de deploy

### Supabase

1. Criar projeto.
2. Ir em Authentication > Users.
3. Criar usuário ADM com e-mail e senha.
4. Copiar o UUID do usuário.
5. Abrir SQL Editor.
6. Executar `supabase/01_schema.sql`.
7. Editar `supabase/02_seed_from_defaults.sql`, trocando `TROQUE_PELO_EMAIL_DO_ADMIN`.
8. Executar `supabase/02_seed_from_defaults.sql`.
9. Editar `supabase/04_link_admin_auth_user.sql`, colocando UUIDs e e-mails reais de admin e dev.gui.
10. Executar `supabase/04_link_admin_auth_user.sql`.
11. Executar `supabase/03_rls_policies.sql`.

### Projeto

1. Editar `dist/config.js` com URL, anon key e e-mail ADM.
2. Testar localmente:

```bash
npm install
npm run preview
```

3. Conferir login `admin` com a senha criada no Supabase Auth.
4. Publicar na Vercel.
5. Configurar o domínio, se necessário.

## 10. Checklist final de validação

- [ ] A página abre sem tela branca.
- [ ] Acesso rápido entra em modo somente leitura.
- [ ] Acesso rápido não consegue editar estoque.
- [ ] Login ADM autentica com Supabase Auth.
- [ ] Após login, o sistema mostra Evandro, Lucas, Guilherme e Marcos.
- [ ] O colaborador escolhido aparece no topo.
- [ ] Entrada de item salva no Supabase.
- [ ] Saída de item salva no Supabase.
- [ ] Histórico do item mostra movimentações.
- [ ] Logs registram o nome da sessão.
- [ ] Requisições atrasadas continuam destacadas.
- [ ] Infraestrutura salva alterações de sala.
- [ ] Logout limpa a sessão local.
- [ ] Outro navegador visualiza alterações após polling/refetch.

## 11. Melhorias futuras opcionais

1. Adicionar Supabase Realtime para reduzir polling.
2. Implementar versionamento transacional por item com RPC Postgres.
3. Criar tela de importação de dados antigos D1.
4. Criar backups automáticos por export CSV/JSON.
5. Separar o frontend em Vite/React futuramente, se o projeto crescer.
6. Criar camada de funções server-side somente para ações sensíveis, se necessário.
