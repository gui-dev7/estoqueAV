# Guia de rollback — AV.Storage v16.5

Use este guia caso a migração para Supabase apresente problema em produção.

## Rollback rápido de frontend

1. Na Vercel, acesse o projeto.
2. Vá em Deployments.
3. Selecione o último deploy estável anterior.
4. Clique em Promote to Production.

## Rollback de banco

Como esta versão não apaga automaticamente o banco antigo, mantenha o projeto Cloudflare/D1 antigo congelado até validar o Supabase.

Recomendação:

1. Não exclua o D1 antigo no primeiro deploy.
2. Não exclua o projeto antigo até validar todos os fluxos.
3. Exporte os dados do Supabase após validação.
4. Só remova infraestrutura antiga quando o checklist estiver 100% concluído.

## Rollback por configuração

Se o problema for apenas chave/env incorreta:

1. Corrija `dist/config.js`.
2. Faça novo deploy.
3. Valide login ADM e acesso rápido.

## Sinais de erro comuns

- Tela abre, mas dados não carregam: URL/anon key incorretas ou RLS bloqueando leitura.
- Login falha: e-mail ADM em `config.js` diferente do Supabase Auth.
- Login funciona, mas escrita falha: `profiles.auth_user_id` não foi vinculado ao UUID do usuário Auth.
- Acesso rápido edita dados: policies RLS foram aplicadas incorretamente.
