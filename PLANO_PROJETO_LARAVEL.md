# Celebra — plano de implementação para o Codex

Documento de trabalho • 20/09/2026 • Nome provisório: Celebra

## 1. Objetivo e escopo

Construir uma plataforma web de eventos com Laravel, inicialmente para um chá de casa nova, reutilizável para casamentos, aniversários, chá de panela e outros eventos. Qualquer pessoa pode se cadastrar gratuitamente e criar quantos eventos quiser. Cada evento possui página pública, identidade visual, informações, lista de presentes e confirmação de presença.

O ambiente de desenvolvimento será macOS + VS Code + Laravel Herd. Este documento é um plano: a aplicação ainda precisa ser implementada. Sem prazo definido e sem cobrança dentro da plataforma.

### Decisões confirmadas pela usuária

- Contas distintas: administrador do sistema e conta normal da organizadora inicial.
- Organizadores: cadastro e login com e-mail e senha.
- Convidados: acesso por nome e telefone, sem senha, SMS, WhatsApp, e-mail ou link individual obrigatório.
- A página do evento pode ser vista sem identificação; identificar ao reservar ou confirmar presença.
- Retorno do convidado: mesmos nome e telefone, com sessão mantida no navegador enquanto válida.
- Presença com quantidade de acompanhantes, sem nomes de acompanhantes.
- Vários presentes por convidado e várias unidades disponíveis por presente.
- Compra externa: o convidado pode usar a loja sugerida ou comprar em outro lugar.
- Presentes cadastrados manualmente; sem catálogo predefinido nesta versão.
- Informações: nome, data, horário, endereço, mapa, contagem regressiva, boas-vindas e orientações.
- Personalização: cores, banners, seções visíveis e ordem das seções.
- Seção independente para cores/materiais recomendados da casa.
- Painel: confirmados e identificação de quem reservou cada presente.
- Visual inicial: utensílios domésticos em tons neutros, inspirado na segunda referência enviada.

### Premissas propostas para a implementação

Aplicar como padrões editáveis, sem interromper o trabalho para escolhas rotineiras:

- Eventos começam em rascunho e são publicados pelo organizador.
- Link público no formato `/e/{slug}`; slug único e estável após publicação.
- Identificação de convidado vale somente dentro de um evento.
- Presença e reserva são independentes: alguém pode reservar antes de confirmar.
- Cancelar presença pergunta se deseja manter ou cancelar os presentes; nada é cancelado silenciosamente.
- Quantidade de acompanhantes é inteiro maior ou igual a zero; sem limite comercial nesta versão.
- Fechar novas confirmações/reservas mantém a consulta e permite cancelamentos; aumentos e novas reservas ficam bloqueados.
- Encerrar o evento torna a área pública somente leitura. Reabertura pelo organizador.
- Exclusão preferencial por arquivamento, preservando histórico.
- Não publicar em servidor nem configurar serviços pagos durante o desenvolvimento local.

## 2. Stack e preparação no Mac

Adotar Laravel 13.x para projeto novo, PHP compatível com o composer.json, starter kit oficial Livewire com autenticação Laravel, Blade, Tailwind CSS e Vite. Usar apenas componentes gratuitos. Pest para testes e Pint para formatação. Fixar dependências nos lockfiles.

Se existir projeto iniciado, inspecionar suas versões e preservar o que funciona; não recriar nem atualizar de versão principal automaticamente.

SQLite local, com migrations portáveis. Banco de produção será definido no deploy; se MySQL/PostgreSQL for escolhido, executar nele os testes de concorrência antes da publicação. Sem Redis, Docker ou API separada como pré-requisito do MVP.

Preparação:

1. Instalar Laravel Herd no macOS e concluir o onboarding. Requer macOS 12 ou superior.
2. Confirmar `php -v`, `composer --version`, `laravel --version`, `node -v` e `npm -v`.
3. Em pasta vazia, criar o projeto com `laravel new celebra`; selecionar Livewire, autenticação Laravel, SQLite e Pest quando solicitado.
4. Abrir a pasta no VS Code. Não executar o scaffold sobre uma pasta com trabalho existente.
5. Configurar `.env`, chave da aplicação, banco e armazenamento público conforme necessário.
6. Executar migrations, `php artisan storage:link`, `npm install`, `npm run build` e `composer run dev`.

O Codex deve verificar os scripts disponíveis antes de executar comandos. Não reinstalar ferramentas já funcionais. O envio de e-mail local usa o driver de log; não apresentar recuperação de senha como entrega real de e-mail até configurar um transporte. Não exigir verificação de e-mail para usar o MVP local.

## 3. Perfis, acesso e privacidade

| Perfil | Permissões |
| --- | --- |
| Visitante | Ver evento publicado e disponibilidade de presentes |
| Convidado identificado | Gerenciar exclusivamente sua participação e reservas naquele evento |
| Organizador | Gerenciar exclusivamente seus eventos, convidados, presentes e personalização |
| Administrador | Listar e suspender usuários/eventos; visualizar dados administrativos; sem impersonação no MVP |

Cadastro público sempre cria `organizer`; jamais aceitar `role` ou `is_admin` do formulário. Criar administrador por comando Artisan com senha digitada em modo oculto. A conta pessoal inicial é normal, criada pelo cadastro. Não inventar e-mails reais nem credenciais fixas. Fixtures de demonstração apenas em ambiente local/teste.

Aplicar Policies e autorização no servidor em todas as ações, inclusive Livewire. Não basta esconder botões. Não retornar nomes, telefones ou IDs de convidados na página pública. Administrador não deve poder suspender o último administrador ativo. Suspensão bloqueia sessões existentes e páginas públicas associadas.

### Acesso simplificado do convidado — decisão explícita

Nome e telefone não comprovam identidade. Quem conhece ambos pode acessar a participação correspondente. A usuária aceitou essa limitação para o MVP; não substituir por OTP ou magic link sem novo pedido e não afirmar que o telefone está verificado.

Implementação:

1. Normalizar telefone brasileiro com DDD, armazenando código do país, sem pontuação; aceitar entrada `+55` ou formato nacional válido. Não inventar ou remover dígitos para corrigir números ambíguos.
2. Preservar nome de exibição e gerar versão de comparação: espaços normalizados, caixa e acentos normalizados. Sem correspondência aproximada de nomes.
3. Buscar por `(event_id, phone_normalized)`.
4. Se não existir, criar participante com nome e telefone e presença ainda não respondida.
5. Se existir, exigir correspondência do nome normalizado; não sobrescrever nome ou criar duplicata ao divergir. Exibir mensagem genérica orientando conferir os dados ou falar com o organizador.
6. Criar acesso em sessão do servidor, regenerando o identificador de sessão; escopar por evento. Nunca autorizar com ID recebido do navegador.
7. Oferecer sair/trocar convidado. Sessão de organizador e sessão de convidado devem permanecer separadas logicamente.
8. Permitir que o organizador corrija dados, auditando a alteração e invalidando o acesso anterior do convidado por uma versão de sessão.

Padrão proposto: sessão de 7 dias, configurável, com cookie HttpOnly, SameSite e Secure em HTTPS. Não guardar autorização em localStorage. Rate limit por IP/evento e por identificador derivado do telefone, CSRF, limite de tamanho de entrada e mensagens sem vazamento de cadastros. Rate limit não elimina o risco de personificação aceito.

## 4. Modelo de dados

Timestamps em todas as tabelas relevantes. Preferir enums PHP com valores string no banco. Relações com chaves estrangeiras e índices. Datas armazenadas em UTC e exibidas no fuso do evento, inicialmente America/Sao_Paulo.

| Tabela | Campos principais e restrições |
| --- | --- |
| users | name, email único, password hash, role, suspended_at |
| events | user_id, title, type, slug único, starts_at, timezone, venue_name, address, latitude/longitude opcionais, welcome_text, instructions, status, rsvp_open, reservations_open, published_at, suspended_at, deleted_at |
| event_themes | event_id único, template_key, cores validadas, font_pair, banner_path, banner_position |
| event_sections | event_id, type, enabled, position; unique(event_id, type) |
| event_palette_items | event_id, label, color_hex opcional, material opcional, position |
| gifts | event_id, name, description, image_path, purchase_url opcional, quantity_total, quantity_reserved, position, archived_at |
| event_guests | event_id, name, name_normalized, phone_normalized, rsvp_status, companions_count, confirmed_at, cancelled_at, session_version; unique(event_id, phone_normalized) |
| gift_reservations | event_guest_id, gift_id, quantity positiva, status, cancelled_at; unique(event_guest_id, gift_id) |
| audit_logs | ator e tipo, event_id opcional, ação, objeto, resumo mínimo, created_at |

`rsvp_status`: unanswered, confirmed, declined. `status` do evento: draft, published, closed. Suspensão e arquivamento são condições separadas.

`quantity_reserved` é um contador atualizado somente junto da reserva na mesma transação. A soma de reservas ativas deve sempre coincidir com ele. Disponível = quantity_total − quantity_reserved. Acrescentar restrições compatíveis para contadores não negativos e quantity_reserved <= quantity_total.

Uma reserva cancelada pode ser reativada; a tabela guarda o estado atual e o audit log registra transições. Garantir que convidado e presente pertençam ao mesmo evento antes de qualquer alteração. Não duplicar event_id em reservas sem necessidade.

## 5. Regras de presentes e concorrência

- Foto, nome, descrição, quantidade total e link opcional. Quantidade inteira positiva.
- Sem checkout, pagamento, Pix, confirmação de compra ou obrigação de comprar na loja indicada.
- Botões separados: “Reservar presente” e “Ver sugestão de compra”. Abrir loja não reserva nada.
- Convidado pode reservar vários itens e escolher unidades, respeitando o saldo.
- Reserva altera disponibilidade imediatamente e não expira automaticamente.
- Item esgotado permanece visível com “Todos reservados”, sem identificar quem reservou.
- Reserva pode ser reduzida, ampliada ou cancelada. Aumento depende de saldo e evento aberto.
- Organizador não reduz quantidade total abaixo do já reservado. Item com histórico é arquivado em vez de removido fisicamente.
- Item arquivado não aceita novas reservas/aumentos, mas aparece em “Meus presentes” para consulta/cancelamento.

### Estratégia obrigatória de consistência

Centralizar em Actions: ReserveGift, UpdateGiftReservation e CancelGiftReservation. Receber a quantidade final desejada, não um incremento cego: repetir o mesmo pedido não pode reservar duas vezes.

Executar alteração de contador, estado da reserva e auditoria na mesma transação. Atualizar o contador com condição atômica de saldo suficiente; conferir linhas afetadas e reverter toda a operação se falhar. Serializar alterações concorrentes no mesmo presente/reserva, incluindo cancelamentos e edição de quantidade pelo organizador. Usar bloqueios quando suportados e estratégia de escrita/retentativa compatível com SQLite; não presumir que lockForUpdate resolve concorrência no SQLite.

Ordenar bloqueios por gift_id em cancelamentos múltiplos para reduzir deadlocks. Em falha de saldo, retornar mensagem amigável e atualizar disponibilidade. Testar duas conexões/processos concorrentes em banco persistente: duas reservas para uma última unidade resultam em exatamente uma reserva aceita. Também testar requisição duplicada, cancelamento repetido e edição simultânea.

## 6. Presença e métricas

- Confirmar presença salva o titular e a quantidade de acompanhantes.
- Alterar a quantidade atualiza a mesma participação; não cria novo registro.
- Cancelar presença zera acompanhantes ativos e oferece manter/cancelar reservas. Registrar escolha explicitamente.
- Confirmar presença novamente reaproveita o participante.
- Não somar convidados apenas identificados ou com presença cancelada.
- Confirmados = quantidade de titulares com status confirmed.
- Acompanhantes = soma de companions_count dos confirmados.
- Total esperado = confirmados + acompanhantes.
- Presentes: mostrar unidades desejadas, reservadas e disponíveis; distinguir unidades de número de itens.

## 7. Telas e rotas propostas

| Área | Telas/rotas |
| --- | --- |
| Institucional | `/` com explicação e acesso ao cadastro/login |
| Conta | `/register`, `/login`, configurações de perfil e senha |
| Organizador | `/dashboard`, `/dashboard/events`, criação e edição de evento |
| Evento no painel | Visão geral, informações, aparência/seções, paleta, presentes, convidados e reservas |
| Prévia | `/dashboard/events/{event}/preview`, apenas dono autorizado |
| Público | `/e/{slug}` |
| Participação | `/e/{slug}/participacao`, formulário de identificação e área “Minha participação” |
| Administração | `/admin`, `/admin/users`, `/admin/events` |

Rotas são propostas: respeitar nomes e convenções do starter kit. Usar POST/PATCH/DELETE com CSRF para mutações; GET não muda estado. No painel, paginação e busca simples por nome/telefone, sem exportação obrigatória nesta versão.

## 8. Direção visual e editor

Página pública com aparência de convite digital, adaptada a celular e desktop. Referência principal: convite de chá de cozinha com jarra e utensílios de madeira, fundo claro, linhas delicadas, títulos serifados e nomes com toque manuscrito. Não copiar logos, contatos, nomes ou imagens de produtos de terceiros das referências.

Paleta inicial sugerida, editável: fundo creme #FAF7F2, superfície #FFFFFF, texto #3E352E, destaque taupe #88715B e borda #DFD4C7. Verificar contraste; manuscrita somente em detalhes. Escolher fontes livres, com fallback local, e ilustrações originais/licenciadas de utensílios. Não exigir serviço pago de imagens.

Seções disponíveis: capa, boas-vindas, informações, contagem regressiva, paleta da casa, presentes, orientações e confirmação de presença. A área Minha participação continua acessível mesmo se o bloco de confirmação for ocultado. Ocultar seção não muda automaticamente as permissões de reserva/presença.

Editor com alternância de visibilidade, ordenação por arraste e botões subir/descer acessíveis, upload de banner e prévia mobile/desktop. Persistir alterações no servidor. Uma biblioteca de templates fica para depois; implementar um template inicial com cores personalizáveis e conteúdo adequado a qualquer tipo de evento.

Paleta da casa é independente do tema: cores ou materiais com nomes (branco, preto, inox, bambu). No chá inicial, o usuário preenche sua paleta real; não inferir suas preferências a partir das imagens.

Mapa sem chave paga obrigatória: endereço + coordenadas opcionais e mapa OpenStreetMap com atribuição preservada, seguindo as regras do provedor escolhido. Sem geocodificação automática no MVP; permitir posicionar marcador. Fornecer link “Abrir no mapa” como alternativa. Tratar ausência de coordenadas claramente.

Contagem regressiva baseada no instante/fuso do evento; não mostrar números negativos. Campos com labels, navegação por teclado, foco visível, feedback de sucesso/erro, estados vazios e botões com área de toque confortável. Testar a partir de 360 px sem rolagem horizontal.

## 9. Organização do código e controles

- Monólito Laravel, sem microserviços, SPA separada ou repositórios genéricos desnecessários.
- Models e relações Eloquent; Policies para autorização; validação em Form Requests ou componentes Livewire.
- Actions para regras transacionais; telas não devem implementar diretamente a contabilidade de reservas.
- Componentes separados para painel, página pública e administração, seguindo a estrutura real do starter kit instalado.
- Configurações do tema em propriedades tipadas/validadas; não aceitar HTML, scripts, CSS ou iframe arbitrário do organizador.
- Escapar textos; links de compra apenas HTTP/HTTPS. Não baixar imagens automaticamente a partir de URLs externas.
- Uploads apenas JPEG/PNG/WebP com limites de tamanho e dimensões, nomes gerados e checagem MIME. SVG enviado pelo usuário fica fora do MVP.
- Audit logs sem senhas, cookies ou telefone integral desnecessário. Registrar publicação, suspensão, correções de convidado e alterações de reservas.
- Nenhum segredo no Git. `.env.example` sem credenciais reais.

## 10. Etapas executáveis e critérios de aceite

### Etapa 0 — diagnóstico e ambiente

Inspecionar diretório, AGENTS.md, Git e ferramentas. Preparar Laravel no Mac ou documentar precisamente o bloqueio. Criar README e `docs/progresso.md` com decisões, checklist e comandos reais.

Aceite: aplicação inicial abre, build executa e versões ficam documentadas. Não afirmar que executou comandos sem executá-los.

### Etapa 1 — contas e isolamento

Configurar autenticação do organizador, papéis, comando para criar admin e Policies. Criar migrations básicas de eventos.

Aceite: cadastro público é normal, admin tem área própria e usuário A não consegue acessar/alterar evento de B por URL ou ação Livewire. Sem credenciais fixas.

### Etapa 2 — eventos e publicação

CRUD de eventos, informações, fuso, slug, rascunho, prévia, publicação e encerramento. Página pública inicial e mapa.

Aceite: rascunho não é público; evento publicado possui link próprio e data correta no fuso. Usuário pode criar vários eventos. Suspensos não ficam disponíveis.

### Etapa 3 — aparência e seções

Template neutro, banner, cores, ordenação/visibilidade e paleta da casa.

Aceite: recarregar preserva mudanças; prévia corresponde à página pública; editar evento A não modifica B; boa leitura no celular.

### Etapa 4 — convidados e presença

Identificação por nome/telefone, sessão por evento, Minha participação, acompanhantes, cancelamento e métricas.

Aceite: primeiro acesso cria uma participação, retorno reconhece a existente, nome divergente não libera acesso, formato diferente do mesmo telefone não duplica participante e outro evento não herda autorização. Métricas refletem alterações.

### Etapa 5 — presentes e reservas

Cadastro manual, imagens, links externos, quantidades, Actions transacionais e interface de reservas.

Aceite: vários presentes por pessoa, saldo correto, cancelamento libera unidades uma só vez, clique repetido não duplica e concorrência não ultrapassa quantidade. Cancelar presença permite decisão explícita sobre reservas.

### Etapa 6 — painel e administração

Resumo de métricas, tabelas de convidados e reservas, busca, correções pelo organizador e suspensão pelo admin.

Aceite: titular/acompanhantes/total separados; organizador vê quem reservou cada presente; dados privados não aparecem para público ou outro organizador. Suspensão revoga acesso efetivo.

### Etapa 7 — validação integrada e entrega local

Executar testes relevantes, Pint e build; validar navegação no navegador se disponível. Criar demonstração local com dados fictícios e instruções para substituí-los. Documentar backup do banco/uploads e itens de deploy sem publicar.

Aceite: dois organizadores isolados, evento em cada conta, dois convidados disputando a última unidade, alteração/cancelamento, reload, encerramento e mobile verificados. README permite iniciar o projeto no Mac. Pendências devem ser declaradas.

## 11. Testes prioritários

Pest feature/integration: isolamento entre organizadores; elevação de privilégio recusada; rascunhos e suspensão; publicação com campos obrigatórios; normalização e unicidade de telefone por evento; nome divergente; sessão cruzada; contagem de acompanhantes; reserva independente de RSVP; pertencimento presente/convidado; saldo insuficiente; quantidade inválida; idempotência; cancelamento repetido; quantidade total abaixo do reservado; arquivo com tipo inválido; fechamento e reabertura; ausência de dados privados nas respostas públicas.

Teste de concorrência real com banco em arquivo ou banco alvo, não somente SQLite em memória compartilhada no processo de teste. Se ambiente não suportar, registrar bloqueio e não declarar a garantia validada. Verificação manual: 360 px e desktop, erros/estados vazios, banner, mapa, seções e retorno do convidado.

## 12. Fora do MVP

Pagamentos e assinaturas; Pix; catálogo de presentes; compra interna; WhatsApp/SMS/e-mail para convidados; verificação de telefone; domínio personalizado; múltiplos coorganizadores; galeria de fotos; importação/exportação; nomes de acompanhantes; lista prévia de convidados; múltiplos templates elaborados; aplicativo móvel. Essas possibilidades não devem atrasar a primeira entrega.

Antes da divulgação ampla, reavaliar identificação dos convidados, recuperação de contas por e-mail, política de dados, hospedagem, backups e banco de produção. Não são serviços obrigatórios para desenvolver localmente.

## 13. Instrução inicial para colar no Codex

> Leia PLANO_PROJETO_LARAVEL.md e implemente o projeto Celebra no diretório atual seguindo as etapas e critérios de aceite. Primeiro inspecione os arquivos, AGENTS.md e versões instaladas. Se já existir uma aplicação Laravel, preserve-a e adapte o plano; não recrie o projeto nem sobrescreva trabalho existente. Use Laravel com Livewire, Blade, Tailwind e SQLite no desenvolvimento macOS. Aplique as decisões confirmadas e as premissas do documento. O acesso do convidado deve ser por nome e telefone sem OTP; organizadores e administrador usam senha. Não acrescente integrações pagas. Implemente incrementos funcionais na ordem do plano e continue enquanto houver condições técnicas, sem pedir aprovação para cada etapa. Registre progresso e decisões em docs/progresso.md, valide cada incremento e informe bloqueios reais. Priorize isolamento de dados e consistência transacional das reservas. Não publique, não crie credenciais fixas e não rode comandos destrutivos sobre dados existentes. No final, entregue o que foi implementado, testes executados, pendências e comandos exatos para iniciar no Mac.

## 14. Referências técnicas oficiais

Consultadas em 20/09/2026. Conferir APIs compatíveis com as versões efetivamente instaladas antes de implementar.

- Laravel / instalação: https://laravel.com/docs/13.x/installation
- Starter kits / Livewire e autenticação: https://laravel.com/docs/13.x/starter-kits
- Query builder / atualizações e bloqueios: https://laravel.com/docs/13.x/queries
- Herd / instalação macOS: https://herd.laravel.com/docs/macos/getting-started/installation

Este documento especifica o produto e a arquitetura proposta. Não representa código entregue, testes executados ou implantação concluída.
