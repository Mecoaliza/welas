# ConectaX

Comunidade privada de aprendizado e troca de conhecimento — Tecnologia, Livros, Idiomas e Fórum.

## Stack

- **Front-end:** Next.js (App Router) + React + TypeScript
- **Estilização:** Tailwind CSS v4 + shadcn/ui (Base UI)
- **Back-end:** Server Actions + Route Handlers
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Autenticação:** Auth.js (NextAuth v5) — credenciais com hash bcrypt, pronto para OAuth
- **Armazenamento de arquivos:** S3-compatível (opcional; URLs externas funcionam sem configurar nada)

## Pré-requisitos

- Node.js 20+
- PostgreSQL (local via Docker, local nativo, ou um serviço gerenciado)

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de ambiente de exemplo e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

   No mínimo, defina `DATABASE_URL` e `AUTH_SECRET` (gere um com `npx auth secret`).

3. Suba um Postgres local (opcional — pule se já tiver um banco):

   ```bash
   docker compose up -d
   ```

   Isso sobe o Postgres na porta `5433` (para não conflitar com uma instalação nativa na 5432). A `DATABASE_URL` do `.env.example` já aponta para essa porta.

4. Rode as migrations e o seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   O seed cria dois usuários de teste, com as senhas definidas em `SEED_ADMIN_PASSWORD` e `SEED_USER_PASSWORD` no `.env` (mínimo 12 caracteres):
   - **Admin:** `admin@conectax.local`
   - **Usuário:** `usuario@conectax.local`

   O seed nunca sobrescreve usuários que já existem — para trocar a senha de um deles, use a tela de perfil.

5. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## Scripts úteis

| Script              | Descrição                                   |
| ------------------- | -------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                  |
| `npm run build`      | Build de produção                            |
| `npm run lint`       | ESLint                                       |
| `npm run db:migrate` | Roda as migrations do Prisma                 |
| `npm run db:seed`    | Popula o banco com dados de exemplo          |
| `npm run db:studio`  | Abre o Prisma Studio para inspecionar o banco |

## Estrutura do projeto

```
prisma/               Schema, migrations e seed
src/
  app/                Rotas (App Router)
    (auth)/           Login, cadastro, recuperação de senha
    (app)/            Área autenticada (home, módulos, fórum, perfil)
    admin/            Painel administrativo
    api/              Route handlers (NextAuth, uploads)
  components/
    ui/               Componentes shadcn/ui (Base UI)
    layout/           Sidebar, header, navegação
    shared/           Componentes reutilizáveis entre módulos
    forum/ admin/ profile/ auth/   Componentes específicos de cada área
  modules/            Regra de negócio por domínio (repository/service/actions/validators)
    auth/ users/ posts/ categories/ tags/ languages/
    likes/ comments/ forum/ search/ admin/ media/
  lib/                Infra: db, auth, s3, mail, rate-limit, slug, constants
  types/              Tipos compartilhados / augmentation do NextAuth
```

## Permissões

- **USER:** visualiza conteúdo, curte, comenta (próprios comentários), participa do fórum (cria tópicos e respostas).
- **ADMIN:** tudo do USER + painel `/admin`, CRUD de conteúdos/categorias/tags/idiomas, moderação de comentários e fórum, gestão de usuários.

Toda checagem de permissão é feita no servidor (middleware + `requireUser`/`requireAdmin` em cada Server Action e página), nunca apenas ocultando botões no front-end.

## Antes de abrir para outras pessoas

- **Nunca exponha `next dev`.** Use `npm run build && npm run start` — o modo de desenvolvimento mostra stack traces e endpoints internos.
- Troque as senhas dos usuários criados pelo seed e defina um `POSTGRES_PASSWORD` forte (veja o `docker-compose.yml`).
- O Postgres do `docker-compose.yml` só escuta em `127.0.0.1`. Não abra a porta 5433 no firewall.
- Configure SMTP (`EMAIL_SERVER_*`): em produção, sem SMTP, o e-mail de redefinição de senha simplesmente não é enviado.
- Se houver um proxy reverso (Nginx, Cloudflare, Vercel) na frente do app, defina `TRUST_PROXY=true` para o limite de tentativas usar o IP real do cliente.
- O limite de tentativas fica em memória: vale para **um** processo. Com várias instâncias, troque por Redis/Upstash (`src/lib/rate-limit.ts`).
- Uploads sem S3 ficam em `storage/uploads/` — inclua essa pasta no backup junto com o banco.

## Deploy (Vercel)

1. Crie um banco Postgres gerenciado (Vercel Postgres, Neon, Supabase, RDS...).
2. Configure as variáveis de ambiente do `.env.example` no projeto da Vercel.
3. Configure o S3 (ex.: Cloudflare R2): na Vercel o disco é temporário, então uploads em `storage/uploads/` se perdem.
4. Faça o deploy. A Vercel roda o script `vercel-build`, que aplica as migrations (`prisma migrate deploy`) antes do `next build`.
5. Crie o admin uma vez, apontando para o banco de produção: `DATABASE_URL="..." npm run db:seed`.

## Login social (preparado, desativado por padrão)

Basta preencher `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` ou `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` no `.env` — os provedores são ativados automaticamente quando as credenciais existem (veja `src/lib/auth.ts`).
