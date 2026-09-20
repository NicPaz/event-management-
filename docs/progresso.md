# Progresso do Celebra

Atualizado em 20/09/2026.

## Diagnóstico

- Aplicação existente preservada; não foi recriada.
- Stack efetiva: PHP 8.5, Laravel 13.32, Inertia 3, React 19, Tailwind CSS 4, Fortify, Wayfinder, SQLite e Pest 5.
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
- [x] Etapa 2 — CRUD, publicação, encerramento e página pública de eventos.
    - [x] Criação, edição, listagem, visualização e arquivamento lógico.
    - [x] Horário local convertido para UTC e reapresentado no fuso do evento.
    - [x] Prévia privada autorizada por policy.
    - [x] Publicação exige data, local e endereço; slug único permanece estável.
    - [x] Rascunhos e suspensos retornam 404 na rota pública.
    - [x] Encerramento mantém consulta pública em modo somente leitura e permite reabertura.
    - [x] Página pública responsiva inicial com informações e link de mapa sem serviço pago.
- [x] Etapa 3 — aparência, seções e paleta da casa.
    - [x] Tema neutro com cinco cores editáveis e validação de contraste.
    - [x] Banner JPEG/PNG/WebP com posição configurável, substituição e remoção segura.
    - [x] Oito seções com visibilidade, arraste e botões acessíveis de ordenação.
    - [x] Paleta da casa independente do tema, com cores e materiais.
    - [x] Componente compartilhado entre prévia, editor e página pública.
    - [x] Editor visual em tela cheia, com controles laterais, prévia responsiva ao vivo e acesso direto pelo painel do evento.
    - [x] Prévia interna baseada na largura real do dispositivo, evitando grids de desktop comprimidos no modo mobile.
- [x] Etapa 4 — convidados, identificação e presença.
    - [x] Nome e telefone brasileiro normalizados sem OTP e sem correspondência aproximada.
    - [x] Acesso em sessão regenerada, escopado por evento e revogável por versão.
    - [x] Rate limit por IP/evento e identificador derivado do telefone.
    - [x] Confirmação, recusa, acompanhantes e cancelamento com escolha explícita sobre reservas.
    - [x] Fluxo de resposta reorganizado em duas escolhas claras: confirmar com acompanhantes ou informar ausência decidindo sobre os presentes.
    - [x] Após confirmar ou recusar presença, o convidado retorna ao convite público do evento.
    - [x] Métricas de confirmados, acompanhantes e total esperado no painel.
    - [x] Audit log mínimo para alterações de presença.
- [x] Etapa 5 — presentes e reservas transacionais.
    - [x] Cadastro manual com descrição, imagem, link HTTP/HTTPS e quantidade total.
    - [x] Arquivamento preserva item e histórico; total não pode ficar abaixo do reservado.
    - [x] Reserva recebe quantidade final, é idempotente e mantém contador e histórico na mesma transação.
    - [x] Aumento usa atualização atômica condicionada ao saldo; alterações são serializadas por presente.
    - [x] Cancelamento repetido não libera unidades duas vezes.
    - [x] Página pública exibe unidades totais, reservadas/disponíveis sem identificar convidados.
    - [x] Cada presente oferece as ações “Presentear” e “Sugestão de compra”.
    - [x] Reserva direta pela vitrine: reutiliza a identificação da sessão ou solicita somente nome e telefone quando necessário.
    - [x] Confirmação de reserva em modal, com ações para continuar escolhendo ou consultar os presentes reservados.
    - [x] Área Minha participação permite reservar vários presentes, alterar quantidade e cancelar.
    - [x] Cancelar presença com a opção correspondente cancela também as reservas ativas.
    - [x] Duas reservas concorrentes validadas em processos e conexões separados sobre SQLite persistente isolado.
- [x] Etapa 6 — painel operacional e suspensão administrativa.
    - [x] Métricas de titulares confirmados, acompanhantes, total esperado, recusas e unidades reservadas.
    - [x] Listagem paginada e busca por nome ou telefone limitada ao evento do organizador.
    - [x] Reservas ativas visíveis por convidado, sem exposição na página pública.
    - [x] Correção de nome, telefone, presença e acompanhantes com auditoria e revogação da sessão anterior quando a identidade muda.
    - [x] Administração pesquisável de organizadores e eventos, com suspensão e reativação auditadas.
    - [x] Suspensão de conta encerra o acesso autenticado; suspensão de evento retira imediatamente a página pública.
- [ ] Etapa 7 — validação integrada e entrega local.
    - [x] Seeder local idempotente com evento, aparência, convidados, estados de presença, presentes e reserva fictícios, sem criar credenciais.
    - [x] README com preparação no Mac, demonstração, substituição dos dados, backup/restauração e checklist de produção sem publicação.
    - [x] Suíte integrada, análise estática, TypeScript, formatter/linter e build executados.
    - [ ] Navegação e aparência ainda precisam de inspeção manual em navegador real a 360 px e desktop.

## Validações executadas

- Baseline antes das alterações: `php artisan test --compact` — 39 testes, 136 asserções, todos aprovados.
- Baseline antes das alterações: `npm run build` — aprovado.
- Final da Etapa 1: `php artisan test --compact` — 54 testes, 206 asserções, todos aprovados.
- Final da Etapa 2: `php artisan test --compact` — 66 testes, 301 asserções, todos aprovados.
- Final das Etapas 3 e 4: `php artisan test --compact` — 82 testes, 473 asserções, todos aprovados.
- Incremento funcional da Etapa 5: `php artisan test --compact` — 89 testes, 496 asserções, todos aprovados.
- Revisão de experiência do editor, página pública e participação: `php artisan test --compact` — 92 testes, 533 asserções, todos aprovados.
- Fluxo de vitrine e reserva direta de presentes: `php artisan test --compact` — 97 testes, 591 asserções, todos aprovados.
- Final da Etapa 5 com concorrência multiprocesso: `php artisan test --compact` — 98 testes, 597 asserções, todos aprovados.
- Final da Etapa 6: `php artisan test --compact` — 107 testes, 690 asserções, todos aprovados.
- Validação integrada da Etapa 7: `php artisan test --compact` — 108 testes, 701 asserções, todos aprovados.
- `vendor/bin/pint --format agent` — aprovado. A opção `--dirty` não funciona sem Git.
- `vendor/bin/phpstan analyse --memory-limit=512M` — aprovado sem erros.
- `npm run types:check` — aprovado.
- Checker de formato/lint em 81 arquivos de frontend e documentação em escopo — aprovado.
- `npm run build` — aprovado; o aviso opcional sobre `fontaine` não impede o build.
- Rotas CRUD, prévia, publicação, encerramento e reabertura conferidas com `php artisan route:list`.
- Rotas de aparência, identificação e presença conferidas com `php artisan route:list`.
- Rotas operacionais de convidados e rotas administrativas de usuários/eventos conferidas com `php artisan route:list`.
- Migrations locais aplicadas e schemas SQLite de eventos, aparência, convidados e auditoria conferidos após a execução.
- Link público de armazenamento criado com `php artisan storage:link`.

## Decisões de implementação

- Datas continuam armazenadas em UTC; cada evento registra seu próprio fuso, inicialmente `America/Sao_Paulo`.
- Papéis e estados usam enums PHP com valores string portáveis no banco.
- Administradores possuem área separada e não gerenciam eventos pela policy de organizador.
- A sessão de conta foi configurada para sete dias, conforme a premissa do plano.
- O acesso do convidado usa a mesma sessão HTTP, mas uma chave e versão independentes por evento; não altera a autenticação da conta.
- Cores do tema são valores hexadecimais validados e o texto exige contraste mínimo de 4,5:1 sobre fundo e superfície.
- A rota “Minha participação” permanece disponível mesmo quando a seção visual de confirmação está oculta.
- O proprietário não recebe ações de convidado ao abrir sua própria página pública; o painel oferece personalização e cópia do link publicado.
- Reservas usam quantidade final, lock compartilhado pelo cache por presente, transação com retentativa e incremento condicional de saldo; a disputa pela última unidade foi validada em processos separados sobre arquivo SQLite real.
- Correções de identidade feitas pelo organizador incrementam a versão da sessão do convidado e não registram telefone no audit log.
- A administração não oferece impersonação; contas administrativas não aparecem na lista suspensível de organizadores.
- A demonstração é criada somente para organizadores existentes em ambiente local/teste, não contém senha fixa e preserva dados anteriores em novas execuções.

## Pendências conhecidas

- O envio de recuperação de senha permanece no driver de log; não representa entrega real de e-mail.
- A verificação visual manual em navegador real nas larguras de 360 px e desktop ainda precisa ser executada na Etapa 7; o editor já oferece ambos os modos de prévia sem rolagem horizontal intencional.
- O `npm run check` global ainda aponta apenas a formatação preexistente de `PLANO_PROJETO_LARAVEL.md`; o conteúdo do plano foi preservado.
