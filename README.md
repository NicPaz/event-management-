# Celebra

Plataforma de eventos em desenvolvimento com Laravel 13, Inertia 3, React 19, Tailwind CSS 4, SQLite e Pest.

## Requisitos locais

- macOS 12 ou superior com Laravel Herd
- PHP 8.3 ou superior
- Composer 2
- Node.js 24 e npm 11

## Preparação

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
```

Para uploads públicos, execute uma vez:

```bash
php artisan storage:link
```

## Desenvolvimento

```bash
composer run dev
```

O script inicia o servidor Laravel e o Vite. A URL padrão do `.env.example` é `http://localhost:8000`.

## Administrador

O cadastro público sempre cria uma conta organizadora. Crie a primeira conta administradora pelo terminal; a senha é solicitada sem aparecer na tela:

```bash
php artisan celebra:create-admin
```

Não há credenciais administrativas fixas no projeto.

## Verificações

```bash
php artisan test --compact
vendor/bin/pint --format agent
vendor/bin/phpstan analyse --memory-limit=512M
npm run types:check
npm run build
```

Enquanto o diretório não possuir Git, o Pint deve ser executado sem `--dirty`. O progresso registra a única pendência atual do `npm run check` global.

O progresso incremental e as pendências estão em `docs/progresso.md`.
# event-management-
