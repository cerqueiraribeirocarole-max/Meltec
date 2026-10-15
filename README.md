# Meltec Ecommerce

Loja de informática com catálogo, carrinho, administração e área de funcionários. Next.js 16, Supabase Auth, Postgres e Storage.

## Desenvolvimento

Instale com `pnpm install --frozen-lockfile`. Copie `.env.example` para `.env.local` e configure as variáveis. Execute `pnpm dev`.

## Vercel

Importe este repositório como Next.js. Configure em Preview e Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_EMAIL`

O banco `ktabuukmfcmhedrrpbbc` já foi configurado. Os arquivos em `supabase/` registram a estrutura aplicada; não reexecute sem consultar o histórico remoto.

Após publicar, configure Site URL e redirecionamento `/api/auth/confirm` em Supabase → Authentication → URL Configuration.

## Recursos

- Catálogo, busca, categorias, imagens e carrinho.
- Consulta com a equipe. Pagamentos online ainda não integrados.
- Administração de produtos, custos, estoque, clientes, equipe e serviços.
- Funcionários cadastram produtos, editam os que criaram e atualizam suas ordens.
- Login com e-mail e senha, confirmação de e-mail e regras RLS.
- Oito produtos fictícios identificados como demonstração.

## Validação

`pnpm typecheck`, `pnpm test` e `pnpm build`.

Nunca adicione senhas, chaves secretas ou `.env.local` ao Git.
