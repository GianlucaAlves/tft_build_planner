# Roadmap e Fluxo de Trabalho

## 1. Objetivo do documento

Este documento organiza o andamento do TFT Build Planner em formato de execucao real.
Ele transforma escopo em trabalho visivel, com prioridade e status claro.
Tambem conecta as tarefas tecnicas com user stories e com os requisitos do sistema.

## 2. Fluxo adotado

O projeto usa Kanban textual com limite de foco para evitar abrir frentes demais ao mesmo tempo.

Colunas do fluxo:

- **Backlog**: itens mapeados, ainda sem refinamento suficiente para execucao imediata.
- **Ready**: itens refinados, com escopo claro, dependencias mapeadas e prontos para iniciar.
- **In Progress**: itens em execucao ativa no ciclo atual.
- **Review / Validation**: itens implementados que aguardam validacao funcional, tecnica ou documental.
- **Done**: itens concluidos e validados.
- **Future Evolution**: itens fora do MVP, planejados para pos-MVP.

Pratica de foco:

- manter no maximo 2 itens em **In Progress** ao mesmo tempo;
- so puxar novo item quando houver capacidade real no ciclo;
- evitar iniciar trabalho que dependa de item ainda nao finalizado.

## 3. Criterios de passagem entre colunas

### Entrada em Ready

- user story relacionada esta definida;
- criterio de aceite esta claro;
- dependencias tecnicas conhecidas;
- arquivo/area impactada identificada.

### Entrada em In Progress

- item veio de **Ready**;
- existe responsavel no ciclo;
- nao ha bloqueio externo impeditivo.

### Entrada em Review / Validation

- implementacao concluida;
- validacao local minima executada;
- documentacao impactada atualizada;
- riscos conhecidos documentados.

### Entrada em Done

- criterio de aceite atendido;
- comportamento validado ponta a ponta no escopo do item;
- sem bloqueio funcional aberto;
- status refletido neste roadmap.

## 4. Quadro atual do projeto

## Backlog

- [ ] Filtros de champions por custo e trait no painel do planner (US-001, US-002) - planejado para o MVP.
- [ ] Endpoint para atualizar build existente (US-003) - planejado para o MVP.
- [ ] Endpoint para remover build compartilhada inativa (US-004) - planejado para o MVP.

## Ready

- [ ] Modelagem Prisma de `Build`, `BuildSlot` e `BuildShare` com token opaco (US-003, US-004, US-005) - planejado para o MVP.
- [ ] Endpoints de build: criar, consultar por id e consultar por token (US-003, US-004, US-005) - planejado para o MVP.
- [ ] Tela principal do planner com board interativo (adicionar/remover unidade) (US-001) - planejado para o MVP.
- [ ] Funcao pura de calculo de traits com thresholds (US-002) - planejado para o MVP.

## In Progress

- [ ] Consolidacao do plano de execucao MVP por fluxo Kanban textual (este documento) - em andamento.

## Review / Validation

- [ ] Nenhum item atualmente em validacao formal.

## Done

- [x] Estrutura base front-end com React + TypeScript + Vite + Tailwind - ja existe.
- [x] Estrutura base back-end com Node.js + TypeScript - ja existe.
- [x] Modelagem inicial de catalogo (Champion, Trait, Ability, ChampionStat, itens recomendados) no Prisma - ja existe.
- [x] Seed/import de catalogo para banco PostgreSQL - ja existe.
- [x] Endpoint para listar champions com paginacao e filtro por nome - ja existe.
- [x] Endpoint para buscar champion por id - ja existe.
- [x] Consumo da API `/champions` no front-end com React Query - ja existe.
- [x] Documentacao base criada (`docs/00` ate `docs/06` + ADRs) - ja existe.

## Future Evolution

- [ ] Autenticacao e autorizacao de usuario.
- [ ] Historico de builds por usuario.
- [ ] Estatisticas de composicao e uso.
- [ ] Integracao com dados oficiais do ecossistema Riot/TFT via adapters.
- [ ] Melhorias visuais avancadas e interacoes ricas de UX.

## 5. Roadmap do MVP

### 1. Consolidar dominio e modelagem de build

**Objetivo:** definir entidades de persistencia da build (`Build`, `BuildSlot`, `BuildShare`) e suas relacoes.
**Por que nesta ordem:** sem modelo consistente nao existe API estavel nem compartilhamento confiavel.
**Principais riscos:** modelagem incompleta de slots, dependencia fraca entre build e share, retrabalho de migration.

### 2. Estruturar persistencia de builds

**Objetivo:** criar fluxo de gravacao e leitura de build no back-end com validacao de entrada.
**Por que nesta ordem:** compartilhamento e recuperacao dependem de build persistida.
**Principais riscos:** payload inconsistente entre front/back e falta de validacao server-side.

### 3. Expor API de builds e compartilhamento

**Objetivo:** disponibilizar endpoints para criar build, consultar build e resolver token opaco.
**Por que nesta ordem:** API precisa existir antes de fechar UX do fluxo no front-end.
**Principais riscos:** contratos instaveis e tratamento fraco para token invalido.

### 4. Construir planner interativo no front-end

**Objetivo:** montar board funcional para adicionar/remover unidades e refletir estado atual.
**Por que nesta ordem:** depende de contratos de API e modelo de composicao claros.
**Principais riscos:** acoplamento de regra de dominio na UI e estado duplicado.

### 5. Implementar calculo de traits em funcao pura

**Objetivo:** calcular traits ativas e thresholds de forma testavel e previsivel.
**Por que nesta ordem:** depende da representacao consolidada da composicao no front e no back.
**Principais riscos:** divergencia entre calculo visual e validacao de dominio.

### 6. Fechar fluxo de compartilhamento por token opaco

**Objetivo:** gerar link compartilhavel e recuperar build por token.
**Por que nesta ordem:** requer build persistida, API estavel e tratamento de erro definido.
**Principais riscos:** token sem unicidade, expiracao indefinida e UX ruim em token invalido.

### 7. Refinar UX basica do MVP

**Objetivo:** melhorar feedback de loading, erro, estado vazio e clareza de composicao.
**Por que nesta ordem:** refinamento visual deve vir depois do fluxo funcional fechado.
**Principais riscos:** antecipar polimento e atrasar entrega de funcionalidade core.

## 6. Evolucoes futuras

- Autenticacao e autorizacao com escopo por usuario.
- Historico de builds salvas e comparacao entre versoes.
- Painel de estatisticas de composicoes.
- Integracao com fontes oficiais do ecossistema Riot/TFT.
- Filtros avancados por custo, trait e contexto de composicao.
- Melhorias visuais e de interacao alem do minimo funcional.

## 7. Dependencias e bloqueios

- Nao faz sentido compartilhar build antes de persistir build.
- Nao faz sentido expor endpoint de token sem contrato de erro para token invalido.
- Nao faz sentido refinar visual pesado antes de fechar fluxo funcional do MVP.
- Nao faz sentido integrar API externa antes de consolidar modelo interno de dominio.
- Nao faz sentido abrir varias frentes de MVP sem limite de WIP.

## 8. Relacao com os documentos do projeto

- [docs/00-visao-geral.md](./00-visao-geral.md)
- [docs/01-dominio-tft.md](./01-dominio-tft.md)
- [docs/02-arquitetura.md](./02-arquitetura.md)
- [docs/03-api.md](./03-api.md)
- [docs/04-banco.md](./04-banco.md)
- [docs/05-deploy.md](./05-deploy.md)
- [docs/06-requisitos.md](./06-requisitos.md)

Este roadmap deriva desses documentos e nao existe isolado.
Requisito, arquitetura, contrato de API, modelagem de banco e plano de entrega devem evoluir juntos.

## 9. Convencoes de atualizacao

- Toda tarefa concluida deve ser movida de coluna no mesmo ciclo em que foi finalizada.
- Tarefa grande deve ser quebrada em subtarefas executaveis antes de entrar em **In Progress**.
- O quadro deve refletir estado real do projeto, nao previsao otimista.
- Backlog deve manter prioridade clara e nao virar lista infinita sem decisao.
- Cada item novo deve indicar se pertence ao MVP ou a evolucao futura.
- Sempre que um requisito mudar, revisar impacto no roadmap e nos documentos tecnicos relacionados.
