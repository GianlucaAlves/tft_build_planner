### docs/06-requisitos.md
```md
# Requisitos do Sistema

## 1. Objetivo do documento
Este documento define os requisitos do **TFT Build Planner** de forma implementável, testável e rastreável.  
Ele serve como referência única para:
- planejamento de implementação (front-end, back-end e banco),
- desenho e revisão de contratos de API,
- definição de cenários de teste e critérios de aceite,
- tomada de decisão arquitetural,
- controle de escopo entre MVP e evolução futura.

Também estabelece fronteiras claras entre:
- requisito funcional,
- requisito não funcional,
- regra de negócio de domínio,
- comportamento de interface,
- decisão de infraestrutura.

---

## 2. Escopo do MVP

### 2.1 O que entra no MVP
1. Consulta de catálogo de champions.
2. Visualização de informações de champions (custo, traits e dados relevantes).
3. Montagem de composição no board (adicionar/remover unidade).
4. Cálculo e exibição de traits ativas por composição.
5. Persistência de build no back-end.
6. Compartilhamento de build por URL com **token opaco**.
7. Recuperação de build compartilhada por token.

### 2.2 O que fica fora do MVP
1. Autenticação e autorização de usuários.
2. Histórico pessoal de builds por conta.
3. Estatísticas avançadas de uso/performance.
4. Integração oficial em tempo real com serviços Riot/TFT.
5. Recomendação automática de composição por algoritmo.

### 2.3 MVP vs evolução futura
- **MVP**: fluxo ponta a ponta para montar, salvar e compartilhar build com base funcional sólida e arquitetura limpa.
- **Evolução futura**: recursos de conta, analytics, integrações externas avançadas e otimizações operacionais.

---

## 3. Requisitos funcionais

### RF-001 — Listar champions
- **Descrição**: o sistema deve permitir listar champions com paginação e filtro textual por nome.
- **Motivo**: viabilizar descoberta de unidades para montagem da composição.
- **Impacto front-end**: tela de listagem com loading/erro/estado vazio e controle de paginação.
- **Impacto back-end**: endpoint de consulta com validação de query.
- **Impacto banco**: uso de índices de busca por nome em `Champion`.
- **Observações**: resposta deve ser estável e previsível para evitar acoplamento da UI ao banco.

### RF-002 — Visualizar detalhes relevantes de champion
- **Descrição**: o usuário deve visualizar custo, traits e informações relevantes de cada champion.
- **Motivo**: permitir decisão tática durante montagem da composição.
- **Impacto front-end**: card/lista de champion com campos de leitura.
- **Impacto back-end**: payload consistente, sem vazar estrutura interna desnecessária.
- **Impacto banco**: leitura de `Champion`, `ChampionTrait`, `Trait`, `ChampionStat`, `Ability`.
- **Observações**: dados exibidos devem vir de contrato de API, não de `rawJson` bruto.

### RF-003 — Adicionar champion à composição
- **Descrição**: o sistema deve permitir adicionar um champion ao board da composição.
- **Motivo**: funcionalidade central do planner.
- **Impacto front-end**: gerenciamento de estado da composição e atualização visual do board.
- **Impacto back-end**: no MVP, validações críticas devem ser reproduzíveis no servidor ao salvar.
- **Impacto banco**: persistência futura em `BuildSlot`.
- **Observações**: regras de limite de board e consistência devem ser respeitadas.

### RF-004 — Remover champion da composição
- **Descrição**: o sistema deve permitir remover unidade previamente adicionada ao board.
- **Motivo**: possibilitar iteração rápida de estratégia.
- **Impacto front-end**: atualização imediata do estado local da composição.
- **Impacto back-end**: validação de estado final no momento de persistir.
- **Impacto banco**: remoção/atualização de registros de `BuildSlot` ao salvar.
- **Observações**: a remoção deve disparar recálculo de estado derivado.

### RF-005 — Calcular traits ativas
- **Descrição**: o sistema deve calcular traits ativas e thresholds atingidos com base na composição atual.
- **Motivo**: entrega do valor de domínio do produto.
- **Impacto front-end**: exibição clara de traits ativas/inativas.
- **Impacto back-end**: cálculo crítico reproduzível para consistência de dados persistidos.
- **Impacto banco**: depende de relações `ChampionTrait` + slots da composição.
- **Observações**: cálculo é regra de domínio, não apenas regra visual.

### RF-006 — Exibir estado atual da build
- **Descrição**: o sistema deve exibir de forma clara o estado da build (unidades no board e efeitos derivados).
- **Motivo**: dar feedback de decisão ao usuário.
- **Impacto front-end**: painel de resumo de composição e traits.
- **Impacto back-end**: quando necessário, validar consistência do estado recebido.
- **Impacto banco**: não obrigatório para estado transitório; obrigatório quando build for salva.
- **Observações**: estado temporário de UI não deve ser confundido com persistência.

### RF-007 — Salvar build
- **Descrição**: o usuário deve poder persistir uma build válida para recuperação posterior.
- **Motivo**: continuidade de uso e base para compartilhamento.
- **Impacto front-end**: ação explícita de salvar e feedback de sucesso/erro.
- **Impacto back-end**: endpoint de criação com validação de payload.
- **Impacto banco**: criação de `Build` e `BuildSlot` (MVP).
- **Observações**: dados derivados podem ser recalculados; persistir apenas o necessário para reconstrução.

### RF-008 — Compartilhar build por URL
- **Descrição**: o sistema deve gerar URL compartilhável usando token opaco vinculado a build persistida.
- **Motivo**: colaboração e troca de estratégia.
- **Impacto front-end**: ação de “compartilhar” e apresentação de link.
- **Impacto back-end**: geração e resolução de token opaco único.
- **Impacto banco**: persistência de `BuildShare` com chave única.
- **Observações**: URL não deve expor ID interno da build.

### RF-009 — Recuperar build compartilhada
- **Descrição**: ao acessar URL válida, o sistema deve recuperar e exibir a build correspondente.
- **Motivo**: completar o fluxo de compartilhamento.
- **Impacto front-end**: tela de leitura da build compartilhada.
- **Impacto back-end**: endpoint de consulta por token com tratamento de erro.
- **Impacto banco**: busca por índice único de token em `BuildShare`.
- **Observações**: em token inválido, retornar erro seguro e compreensível.

### RF-010 — Preparar integração externa sem contaminar domínio
- **Descrição**: o sistema deve manter fronteira de adaptação para dados externos de TFT (futuro).
- **Motivo**: evoluir fontes de dados sem quebrar regra de negócio interna.
- **Impacto front-end**: manter contratos estáveis independentemente da fonte externa.
- **Impacto back-end**: camada de adapter/mapper para transformação de payload externo.
- **Impacto banco**: modelo interno continua canônico.
- **Observações**: requisito de arquitetura funcional para sustentabilidade de evolução.

---

## 4. Requisitos não funcionais

### RNF-001
- **Categoria**: Arquitetura
- **Descrição**: o sistema deve separar UI, domínio e infraestrutura.
- **Por que é importante**: reduz acoplamento e facilita evolução.
- **Impacto técnico**: organização por camadas no front e no back.

### RNF-002
- **Categoria**: Segurança
- **Descrição**: toda entrada de API deve ser validada (params, query e body).
- **Por que é importante**: evitar inconsistência e abuso de endpoint.
- **Impacto técnico**: schemas de validação e respostas 400 padronizadas.

### RNF-003
- **Categoria**: Segurança
- **Descrição**: segredos e credenciais não podem ser expostos no cliente.
- **Por que é importante**: proteção de ambiente e dados.
- **Impacto técnico**: uso correto de variáveis de ambiente públicas vs privadas.

### RNF-004
- **Categoria**: Confiabilidade
- **Descrição**: erros devem ser tratados de forma consistente e segura.
- **Por que é importante**: previsibilidade para cliente e manutenção.
- **Impacto técnico**: formato padronizado de erro e sem stack sensível.

### RNF-005
- **Categoria**: Manutenibilidade
- **Descrição**: contratos de API devem ser estáveis e documentados.
- **Por que é importante**: evita quebra entre front e back.
- **Impacto técnico**: documentação em `docs/03-api.md` + versionamento de rota.

### RNF-006
- **Categoria**: Testabilidade
- **Descrição**: regras de cálculo de traits devem ser implementadas em funções puras testáveis.
- **Por que é importante**: reduzir regressões em regra de domínio.
- **Impacto técnico**: extração de cálculo para camada de domínio.

### RNF-007
- **Categoria**: Usabilidade
- **Descrição**: UI deve tratar explicitamente loading, erro e estado vazio.
- **Por que é importante**: experiência previsível em rede real.
- **Impacto técnico**: estados de interface em componentes de listagem e board.

### RNF-008
- **Categoria**: Desempenho
- **Descrição**: consultas de catálogo devem suportar paginação.
- **Por que é importante**: evitar payloads excessivos.
- **Impacto técnico**: `skip/take` e índices no banco.

### RNF-009
- **Categoria**: Portabilidade/Deploy
- **Descrição**: back-end deve ser executável em container Docker.
- **Por que é importante**: consistência entre ambientes.
- **Impacto técnico**: padronização de runtime da API.

### RNF-010
- **Categoria**: Observabilidade básica
- **Descrição**: registrar eventos de erro relevantes sem dados sensíveis.
- **Por que é importante**: diagnóstico de falhas.
- **Impacto técnico**: estratégia de logging mínimo estruturado no servidor.

### RNF-011
- **Categoria**: Evolução arquitetural
- **Descrição**: integração externa futura deve passar por adapters/mappers.
- **Por que é importante**: preservar domínio interno estável.
- **Impacto técnico**: camada explícita de transformação de dados.

### RNF-012
- **Categoria**: Qualidade de código
- **Descrição**: tipagem consistente entre DTOs, domínio e persistência.
- **Por que é importante**: clareza de contrato e redução de erros.
- **Impacto técnico**: evitar `any` e evitar reaproveitar tipo Prisma diretamente na UI.

---

## 5. Regras de negócio

## 5.1 Regras de domínio (TFT/planner)
1. A composição possui limite de slots de board definido pela regra do planner.
2. Traits ativas são derivadas da contagem de champions válidos na composição atual.
3. Threshold de trait deve ser calculado com base nas relações Champion-Trait canônicas.
4. Build compartilhada representa estado persistido, não estado transitório de tela.
5. Cálculo crítico de traits deve ser reproduzível no back-end ao validar/persistir build.
6. Dados de champions/traits são canônicos e independentes da interface.

## 5.2 Regras de interface
1. Adicionar/remover unidade deve refletir imediatamente no estado visual.
2. Alteração de composição deve atualizar painel de traits e resumo da build.
3. Feedback de erro deve ser compreensível para usuário final, sem detalhes internos.

## 5.3 Regras de infraestrutura
1. API não confia no cliente para integridade da build.
2. Token de compartilhamento deve ser opaco, único e não semântico.
3. Segredos de ambiente devem permanecer somente no servidor.
4. CORS deve restringir origens conforme ambiente.

---

## 6. User stories

### US-001
- **Descrição**: Como jogador de TFT, eu quero montar uma composição no board, para testar variações de estratégia rapidamente.
- **Prioridade**: Alta
- **Requisitos relacionados**: RF-003, RF-004, RF-006

### US-002
- **Descrição**: Como jogador de TFT, eu quero visualizar traits ativas da minha composição, para entender a força da build.
- **Prioridade**: Alta
- **Requisitos relacionados**: RF-005, RF-006

### US-003
- **Descrição**: Como jogador de TFT, eu quero salvar uma build, para reutilizar a composição depois.
- **Prioridade**: Alta
- **Requisitos relacionados**: RF-007

### US-004
- **Descrição**: Como jogador de TFT, eu quero compartilhar minha build por link, para enviar a composição para outras pessoas.
- **Prioridade**: Alta
- **Requisitos relacionados**: RF-008, RF-009

### US-005
- **Descrição**: Como visitante, eu quero abrir um link compartilhado e ver a build correspondente, para analisar a composição recebida.
- **Prioridade**: Alta
- **Requisitos relacionados**: RF-009

### US-006
- **Descrição**: Como usuário recorrente, eu quero ter histórico pessoal de builds, para comparar minhas estratégias ao longo do tempo.
- **Prioridade**: Média
- **Requisitos relacionados**: Evolução futura (fora do MVP)

---

## 7. Critérios de aceitação

### US-001 — Montar composição
- Ao adicionar um champion válido ao board, o estado da composição deve refletir a mudança imediatamente.
- Ao remover um champion do board, ele deve deixar de compor o estado atual.
- O board não deve aceitar mais unidades que o limite definido.

### US-002 — Visualizar traits ativas
- Sempre que a composição mudar, traits ativas devem ser recalculadas.
- O usuário deve visualizar quais traits estão ativas e qual threshold foi atingido.
- Traits sem threshold atingido não devem ser exibidas como ativas.

### US-003 — Salvar build
- Ao enviar build válida, a API deve persistir dados suficientes para reconstrução completa.
- Se algum champion da build não existir, a API deve rejeitar com erro de validação/consistência.
- Em sucesso, a API deve retornar identificador da build persistida.

### US-004 — Compartilhar build
- Ao solicitar compartilhamento de build válida, a API deve gerar token opaco único.
- A URL retornada não deve conter ID interno exposto.
- O token deve permitir recuperar a build associada.

### US-005 — Abrir build compartilhada
- Ao acessar token válido, o sistema deve retornar a build correspondente.
- Ao acessar token inválido/inexistente, o sistema deve retornar erro seguro e claro.
- O front-end deve apresentar estado de erro de forma compreensível.

---

## 8. Rastreabilidade

| User Story | Requisitos Funcionais | Regras de Negócio | Documentos Relacionados |
|---|---|---|---|
| US-001 | RF-003, RF-004, RF-006 | Domínio 1, 2 / Interface 1 | [docs/01-dominio-tft.md](./01-dominio-tft.md), [docs/02-arquitetura.md](./02-arquitetura.md) |
| US-002 | RF-005, RF-006 | Domínio 2, 3, 5 | [docs/01-dominio-tft.md](./01-dominio-tft.md), [docs/03-api.md](./03-api.md) |
| US-003 | RF-007 | Domínio 4, 5 / Infra 1 | [docs/03-api.md](./03-api.md), [docs/04-banco.md](./04-banco.md), [docs/adr/ADR-001-arquitetura-inicial-do-projeto.md](./adr/ADR-001-arquitetura-inicial-do-projeto.md) |
| US-004 | RF-008 | Infra 2 / Domínio 4 | [docs/03-api.md](./03-api.md), [docs/04-banco.md](./04-banco.md), [docs/adr/ADR-003-estrategia-de-compartilhamento-de-builds.md](./adr/ADR-003-estrategia-de-compartilhamento-de-builds.md) |
| US-005 | RF-009 | Infra 2, 4 | [docs/03-api.md](./03-api.md), [docs/05-deploy.md](./05-deploy.md) |
| US-006 | Evolução futura | Domínio (extensão de ownership) | [docs/00-visao-geral.md](./00-visao-geral.md), [docs/02-arquitetura.md](./02-arquitetura.md) |

Referências base:
- [docs/00-visao-geral.md](./00-visao-geral.md)
- [docs/01-dominio-tft.md](./01-dominio-tft.md)
- [docs/02-arquitetura.md](./02-arquitetura.md)
- [docs/03-api.md](./03-api.md)
- [docs/04-banco.md](./04-banco.md)
- [docs/05-deploy.md](./05-deploy.md)
- [docs/adr/ADR-001-arquitetura-inicial-do-projeto.md](./adr/ADR-001-arquitetura-inicial-do-projeto.md)
- [docs/adr/ADR-002-separacao-entre-dados-do-jogo-dominio-e-integracoes.md](./adr/ADR-002-separacao-entre-dados-do-jogo-dominio-e-integracoes.md)
- [docs/adr/ADR-003-estrategia-de-compartilhamento-de-builds.md](./adr/ADR-003-estrategia-de-compartilhamento-de-builds.md)

---

## 9. Impacto na arquitetura

### Front-end
- Necessidade de estado claro para composição (board) separado de catálogo.
- UI deve tratar loading/erro/vazio em consultas de API.
- Exibição de traits depende de regra de domínio (local e/ou validada no servidor).

### Back-end
- Endpoints de build exigem validação robusta de payload.
- Cálculo crítico de consistência da build não pode depender só do cliente.
- Compartilhamento requer serviço de token opaco e resolução por token.

### Banco
- Além de catálogo, MVP passa a exigir `Build`, `BuildSlot` e `BuildShare`.
- Índices e unicidade tornam-se críticos para performance e integridade.

### Contratos de API
- DTOs explícitos para criação/consulta de build e compartilhamento.
- Erros padronizados para facilitar consumo no front.

### Integração externa futura
- Necessidade de adapter para mapear dados externos para modelo interno.
- Domínio e contratos internos devem permanecer estáveis mesmo com mudança de fonte.

---

## 10. Riscos e pontos de atenção

1. **Misturar regra de domínio com comportamento visual**  
   Risco: inconsistência de cálculo e dificuldade de teste.  
   Mitigação: extrair cálculo de traits para camada de domínio.

2. **Salvar dados derivados desnecessários**  
   Risco: divergência entre persistido e recalculado.  
   Mitigação: persistir base mínima e recalcular derivados quando necessário.

3. **Confiar cálculo apenas no front-end**  
   Risco: dados inválidos persistidos.  
   Mitigação: validação e reprodução de regra crítica no back-end.

4. **Acoplar modelo interno a payload externo futuro**  
   Risco: alto custo de manutenção ao trocar fonte.  
   Mitigação: adapters/mappers e fronteira clara de integração.

5. **Crescer sem contratos claros**  
   Risco: quebra de integração front-back e regressões.  
   Mitigação: DTOs versionados, documentação viva e critérios de aceitação objetivos.
```