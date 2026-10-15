# Meltec — Supabase + Vercel

Projeto Supabase: `ktabuukmfcmhedrrpbbc` (`meltec-ecommerce`).

A estrutura e as políticas SQL já foram aplicadas no projeto. O catálogo inclui oito produtos fictícios. Nunca execute as migrações novamente sem consultar o histórico remoto.

## Aplicação

Este checkout migra o sistema de Cloudflare D1/ChatGPT para Next.js, Supabase Auth, Postgres e Supabase Storage. O checkout original da loja continua separado.

Variáveis necessárias na Vercel (Preview e Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_EMAIL` — mesmo e-mail autorizado em `meltec_private.admins`.

Somente a chave publicável é usada. A aplicação não precisa de chave `service_role`. As regras RLS protegem os dados no banco.

Após obter a URL da Vercel, configure o Site URL e a URL de redirecionamento `/api/auth/confirm` no Supabase Authentication → URL Configuration. O proprietário cria sua própria conta pela página `/login` e confirma o e-mail. Os funcionários usam o e-mail cadastrado no painel. A criação de uma conta não concede permissão de funcionário.

## Validação realizada

- Next.js production build e TypeScript passaram.
- Sete testes de permissões passaram.
- API REST do Supabase devolveu os oito produtos, sem custos.
- Sessão RLS de funcionário permitiu atualizar a etapa da ordem atribuída e rejeitou alteração de dados do cliente.
- Auditor de segurança do Supabase não apontou alertas.

Publicação na Vercel e testes de login no domínio final ainda pendentes. Pagamentos reais não foram integrados.
