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
    - [x] Nove seções com visibilidade, arraste e botões acessíveis de ordenação.
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
    - [x] Área Minha participação exibe somente reservas ativas e permite liberar integralmente cada reserva após confirmação.
    - [x] Cancelar presença com a opção correspondente cancela também as reservas ativas.
    - [x] Duas reservas concorrentes validadas em processos e conexões separados sobre SQLite persistente isolado.
- [x] Etapa 6 — painel operacional e suspensão administrativa.
    - [x] Métricas de titulares confirmados, acompanhantes, total esperado, recusas e unidades reservadas.
    - [x] Listagem paginada e busca por nome ou telefone limitada ao evento do organizador.
    - [x] Reservas ativas visíveis por convidado, sem exposição na página pública.
    - [x] Correção de nome, telefone, presença e acompanhantes com auditoria e revogação da sessão anterior quando a identidade muda.
    - [x] Administração pesquisável de organizadores e eventos, com suspensão e reativação auditadas.
    - [x] Suspensão de conta encerra o acesso autenticado; suspensão de evento retira imediatamente a página pública.
- [x] Etapa 7 — validação integrada e entrega local.
    - [x] Seeder local idempotente com evento, aparência, convidados, estados de presença, presentes e reserva fictícios, sem criar credenciais.
    - [x] README com preparação no Mac, demonstração, substituição dos dados, backup/restauração e checklist de produção sem publicação.
    - [x] Suíte integrada, análise estática, TypeScript, formatter/linter e build executados.
    - [x] Navegação, aparência, editor e fluxos de convidado inspecionados em Chrome real a 360 px e 1440 px.
- [x] Etapa 8 — expansão de temas, privacidade pública e reorganização operacional.
    - [x] Catálogo reutilizável com 20 temas funcionais: quatro opções distintas para cada um dos cinco tipos de evento.
    - [x] Escolha e prévia fiel do tema na criação, com validação entre categoria e tema.
    - [x] Troca e restauração do tema no editor mediante confirmação clara do que será substituído.
    - [x] Tipografia, composição de capa, decoração, cartões e botões variam por tema, além das paletas.
    - [x] Banner e background independentes, com upload, substituição, remoção, preenchimento, posição e sobreposição ajustável.
    - [x] Nova seção ordenável “Quem já confirmou”, desativada por padrão e sem envio dos nomes quando oculta.
    - [x] “Meus presentes” simplificado para reservas ativas, com foto, quantidade informativa, cancelamento integral confirmado e retorno explícito ao convite.
    - [x] Presentes esgotados aparecem depois dos disponíveis, preservando a ordem de cada grupo, com selo e botão “Já reservado”.
    - [x] Navegação principal separada em Visão geral, Eventos, Presentes e Convidados.
    - [x] Áreas de Presentes e Convidados com seletor seguro de evento, seleção automática quando há apenas um e contexto preservado por URL.
    - [x] Isolamento entre organizadores validado também contra manipulação do parâmetro de evento.
- [x] Etapa 9 — controles de mídia, tipografia e refinamento das áreas operacionais.
    - [x] Banner e imagem de fundo possuem ações explícitas e independentes de remoção, inclusive para arquivos selecionados ainda não salvos.
    - [x] Tipografia de títulos e textos é configurável separadamente por uma lista permitida, com amostras, fallbacks e aplicação na prévia, convite público e Minha participação.
    - [x] A migration preserva a tipografia efetiva dos eventos existentes e os temas mantêm padrões próprios restauráveis.
    - [x] Convidados são exibidos em tabela no desktop e lista compacta no celular, mantendo busca, paginação, métricas, edição e consulta às reservas.
    - [x] A seção pública de confirmados usa uma lista simples somente com os nomes dos titulares autorizados.
    - [x] O cadastro de presente foi movido para modal acessível, com prévia de foto, retenção após validação, confirmação de descarte e bloqueio de envio repetido.

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
- Validação integrada da Etapa 8: `php artisan test --compact` — 125 testes, 866 asserções, todos aprovados.
- Testes focados da Etapa 9: 45 testes e 459 asserções, todos aprovados.
- Validação integrada da Etapa 9: `php artisan test --compact` — 128 testes, 918 asserções, todos aprovados.
- `vendor/bin/pint --format agent` — aprovado. A opção `--dirty` não funciona sem Git.
- `vendor/bin/phpstan analyse --memory-limit=512M` — aprovado sem erros.
- `npm run types:check` — aprovado.
- Checker de formato/lint em 81 arquivos de frontend e documentação em escopo — aprovado.
- `npm run build` — aprovado; o aviso opcional sobre `fontaine` não impede o build.
- `npm run types:check` — aprovado após as novas telas e tokens visuais.
- `vendor/bin/phpstan analyse --memory-limit=512M` — aprovado sem erros após a Etapa 8.
- `vp check` nos nove arquivos de frontend alterados — aprovado sem avisos ou erros.
- `vendor/bin/phpstan analyse --memory-limit=512M` — aprovado sem erros após a Etapa 9.
- `vp check` nos nove arquivos de frontend da Etapa 9 — aprovado sem avisos ou erros.
- `npm run build` — aprovado após a Etapa 9; permanece apenas o aviso opcional já conhecido sobre `fontaine`.
- Rotas CRUD, prévia, publicação, encerramento e reabertura conferidas com `php artisan route:list`.
- Rotas de aparência, identificação e presença conferidas com `php artisan route:list`.
- Rotas operacionais de convidados e rotas administrativas de usuários/eventos conferidas com `php artisan route:list`.
- Migrations locais aplicadas e schemas SQLite de eventos, aparência, convidados e auditoria conferidos após a execução.
- Link público de armazenamento criado com `php artisan storage:link`.
- Navegação validada em Chrome headless real com banco temporário isolado: página pública, painel do evento, editor desktop/mobile, convidados, participação, reserva completa e administração.
- Todas as páginas verificadas em 360 px permaneceram sem rolagem horizontal; os cards da prévia mobile e os modais foram conferidos visualmente.
- A inspeção encontrou e permitiu corrigir a hidratação SSR do contador e o corte do card administrativo de evento no mobile.

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
- O contador regressivo renderiza marcadores determinísticos durante SSR e começa a calcular após a hidratação, evitando divergência entre servidor e navegador.
- Os presets dos temas ficam centralizados em um catálogo de domínio; a página pública e os cartões de prévia consomem os mesmos tokens visuais.
- A troca/restauração de tema redefine somente aparência e imagens; seções, dados do evento, presentes, convidados e reservas permanecem intactos.
- A lista pública de confirmados é consultada e serializada somente quando sua seção está habilitada.
- O contexto das áreas operacionais usa o identificador do evento na query string, sempre resolvido dentro dos eventos do organizador autenticado.
- A tipografia pública aceita somente chaves do catálogo da aplicação; não recebe CSS nem URLs externas. Instrument Sans é empacotada pelo build e as demais opções usam pilhas locais com fallbacks genéricos.
- O modal de cadastro usa o estado do formulário Inertia para preservar valores em erros e uma trava síncrona adicional ao estado de processamento para evitar cliques duplicados.
- Arquivos de aparência só são excluídos fisicamente quando pertencem à pasta do evento e não estão mais referenciados por nenhum banner ou background.

## Pendências conhecidas

- O envio de recuperação de senha permanece no driver de log; não representa entrega real de e-mail.
- O `npm run check` global ainda aponta apenas a formatação preexistente de `PLANO_PROJETO_LARAVEL.md`; o conteúdo do plano foi preservado.
