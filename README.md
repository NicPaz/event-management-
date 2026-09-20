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

## Demonstração local

Crie uma conta organizadora pela tela de cadastro e execute:

```bash
php artisan db:seed --class=EventSeeder
```

O seeder funciona somente em `local` e `testing`, não cria contas nem senhas e adiciona um evento publicado fictício para cada organizador existente. Ele preserva eventos já criados e pode ser executado novamente sem duplicar a demonstração.

Para experimentar como convidado, abra o link público do evento de demonstração e use `Marina Alves` com o telefone `(11) 91111-1111`. O evento também inclui convidados com outros estados de presença, paleta, presentes e uma reserva ativa. Todos esses dados podem ser editados ou o evento pode ser arquivado pelo painel.

Para validar isolamento com duas contas, cadastre dois organizadores antes de executar o seeder. Cada conta receberá seu próprio evento e continuará sem acesso aos dados da outra.

## Verificações

```bash
php artisan test --compact
vendor/bin/pint --format agent
vendor/bin/phpstan analyse --memory-limit=512M
npm run types:check
npm run build
```

Enquanto o diretório não possuir Git, o Pint deve ser executado sem `--dirty`. O progresso registra a única pendência atual do `npm run check` global.

## Backup local

Pare o servidor antes de copiar o SQLite. O backup mínimo precisa incluir o banco e os uploads públicos:

```bash
mkdir -p backups
cp database/database.sqlite backups/database.sqlite
tar -czf backups/uploads.tar.gz storage/app/public
```

Guarde também o `.env` em um cofre de segredos separado; ele contém a chave de criptografia e não deve entrar no Git. Para restaurar, use uma instalação da mesma versão, recoloque `database.sqlite` e o conteúdo de `storage/app/public`, execute `php artisan storage:link` e valide com `php artisan migrate:status`.

## Preparação para produção

Nenhum deploy é feito automaticamente por este projeto. Antes de publicar:

- Configure `APP_ENV=production`, `APP_DEBUG=false`, HTTPS, domínio e uma `APP_KEY` protegida.
- Use banco, cache, sessões, filas e armazenamento persistentes; SQLite e disco local servem apenas ao desenvolvimento previsto aqui.
- Configure e teste um provedor de e-mail para recuperação de senha — localmente o envio permanece no log.
- Automatize backups do banco e uploads, com teste periódico de restauração.
- Execute `php artisan migrate --force`, `npm run build`, `php artisan optimize`, um worker de filas e o agendador do Laravel no processo de release.
- Revise política de privacidade, retenção dos dados dos convidados e monitoramento antes de divulgação ampla.

O progresso incremental e as pendências estão em `docs/progresso.md`.
