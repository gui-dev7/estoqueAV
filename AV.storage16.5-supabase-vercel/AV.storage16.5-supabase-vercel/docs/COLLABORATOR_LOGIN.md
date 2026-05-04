# AV.Storage v16.5 — Login por colaborador

## O que mudou

O modo administrativo agora funciona em duas etapas:

1. O usuário valida o acesso com login e senha.
2. Após a validação, escolhe um dos colaboradores autorizados:
   - Evandro
   - Lucas
   - Guilherme
   - Marcos

O nome escolhido passa a ser usado em:

- entradas de estoque;
- saídas de estoque;
- movimentações;
- logs;
- histórico do item;
- atualizações de infraestrutura.

## Aliases de login

O frontend aceita os seguintes aliases:

```text
admin   -> perfil Administrador / T2
dev.gui -> perfil Desenvolvedor / T1
```

As senhas não ficam no código. Cadastre as senhas diretamente no Supabase Auth para os e-mails configurados em `dist/config.js`.

## Configuração no Supabase

1. Crie os usuários em Authentication > Users.
2. Use os e-mails definidos em `dist/config.js`:
   - `adminEmail`
   - `developerEmail`
3. Rode `supabase/04_link_admin_auth_user.sql` substituindo os UUIDs reais.
4. Rode `supabase/03_rls_policies.sql` depois do vínculo.

## Dados adicionados

A tabela `session_collaborators` guarda os colaboradores permitidos para seleção de sessão.

```sql
select * from public.session_collaborators order by sort_order;
```
