# Progresso do Celebra

Atualizado em 20/09/2026.

## Diagnóstico

- Aplicação existente preservada; não foi recriada.
- Stack efetiva: PHP 8.5, Laravel 13.17+, Inertia 3, React 19, Tailwind CSS 4, Fortify, Wayfinder, SQLite e Pest 5.
- Ferramentas locais: Composer 2.8, Laravel Installer 5.32, Node.js 24.13 e npm 11.6.
- O starter instalado é React/Inertia, portanto ele substitui a sugestão de Livewire do plano.
- O diretório não possui repositório Git inicializado. Nenhum `git init` foi executado automaticamente.

## Etapas

- [x] Etapa 0 — ambiente inspecionado; README e comandos locais registrados; aplicação, testes e build validados.
- [x] Etapa 1 — contas e isolamento.
    - [x] Papéis `organizer` e `administrator`.
    - [x] Cadastro público sem elevação de privilégio por payload.
    - [x] Comando interativo e sem credenciais fixas para criar administrador.
    - [x] Suspensão encerra a sessão ao acessar áreas protegidas.
    - [x] Modelo, migration, factory e policy iniciais de eventos.
    - [x] Listagem e visualização de eventos isoladas por organizador.
    - [x] Área administrativa protegida por papel.
    - [x] Matriz de autorização e validação final do incremento.
- [ ] Etapa 2 — CRUD, publicação, encerramento e página pública de eventos.
- [ ] Etapa 3 — aparência, seções e paleta da casa.
- [ ] Etapa 4 — convidados, identificação e presença.
- [ ] Etapa 5 — presentes e reservas transacionais.
- [ ] Etapa 6 — painel operacional e suspensão administrativa.
- [ ] Etapa 7 — validação integrada e entrega local.

## Validações executadas

- Baseline antes das alterações: `php artisan test --compact` — 39 testes, 136 asserções, todos aprovados.
- Baseline antes das alterações: `npm run build` — aprovado.
- Final da Etapa 1: `php artisan test --compact` — 54 testes, 206 asserções, todos aprovados.
- `vendor/bin/pint --format agent` — aprovado. A opção `--dirty` não funciona sem Git.
- `vendor/bin/phpstan analyse --memory-limit=512M` — aprovado sem erros.
- `npm run types:check` — aprovado.
- Checker de formato/lint nos oito arquivos frontend/documentação alterados — aprovado.
- `npm run build` — aprovado; o aviso opcional sobre `fontaine` não impede o build.
- Migrations locais aplicadas e schema SQLite de `events` conferido após a execução.

## Decisões de implementação

- Datas continuam armazenadas em UTC; cada evento registra seu próprio fuso, inicialmente `America/Sao_Paulo`.
- Papéis e estados usam enums PHP com valores string portáveis no banco.
- Administradores possuem área separada e não gerenciam eventos pela policy de organizador.
- A sessão de conta foi configurada para sete dias, conforme a premissa do plano.

## Pendências conhecidas

- O envio de recuperação de senha permanece no driver de log; não representa entrega real de e-mail.
- A concorrência real de reservas só poderá ser validada após a Etapa 5.
- A verificação visual em navegador e larguras de 360 px/desktop fica para os incrementos com telas públicas completas.
- O `npm run check` global ainda aponta apenas a formatação preexistente de `PLANO_PROJETO_LARAVEL.md`; o conteúdo do plano foi preservado.
