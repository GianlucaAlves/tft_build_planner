# Dominio TFT

## Visao do dominio

O dominio do planner de TFT organiza tres blocos principais:

- catalogo do jogo (campeoes, traits, itens, atributos base);
- estado da composicao atual (o que o usuario montou agora);
- artefatos persistidos (builds salvas e compartilhaveis).

A regra central: o sistema precisa distinguir claramente dados permanentes do jogo, estado transitorio da interface e dados de usuario persistidos.

## Conceitos centrais

- Champion: unidade oficial do jogo no catalogo.
- Trait: sinergia associada a campeoes.
- Item: objeto equipavel/recomendado associado a campeoes ou slots.
- Build: composicao persistida de um usuario (ou anonima em etapa inicial).
- BuildSlot: posicao da composicao que referencia um campeao.
- Trait ativa: resultado derivado da composicao atual, nao tabela principal.
- BuildShare: representacao de compartilhamento por token opaco.

## Entidades principais

### Champion

Representa o campeao do catalogo. Atualmente existe no banco.

Atributos relevantes (estado atual):

- id (cuid string)
- apiName, fallbackSlug, imageSlug
- name, cost, imageUrl
- powerScore, rawJson

### Trait

Representa a sinergia do catalogo. Atualmente existe no banco.

Atributos relevantes:

- id, name, slug, iconUrl, rawJson

### Item

No estado atual, Item ainda nao esta modelado como tabela dedicada.

Hoje existe:

- itemApiName em ChampionRecommendedItem.

Evolucao futura recomendada:

- tabela Item para metadados canonicos (nome, icon, descricao, tier, etc.).

### Build (evolucao futura para MVP funcional completo)

Representa uma composicao salva.

Atributos propostos:

- id
- nome da build
- metadados de contexto (set, patch quando aplicavel)
- ownership (usuario ou anonimo)
- timestamps

### BuildSlot (evolucao futura para MVP funcional completo)

Representa uma unidade ocupando uma posicao no board da build.

Atributos propostos:

- id
- buildId
- championId
- boardPosition (x, y ou indice)
- itens equipados no slot (normalizado)

### User (evolucao futura)

Entidade de conta/autenticacao. Nao implementada no estado atual.

### BuildShare / SharedBuildLink (evolucao futura)

Entidade para compartilhar build por token opaco.

Atributos propostos:

- id
- buildId
- shareToken (opaco, unico)
- ativo/expiracao opcional
- createdAt

## Relacoes entre entidades

Estado atual implementado:

- Champion 1:N ChampionStat
- Champion 1:1 Ability
- Champion N:N Trait (via ChampionTrait)
- Champion 1:N ChampionRecommendedItem

Evolucao futura:

- Build 1:N BuildSlot
- Build N:1 User (quando autenticacao existir)
- Build 1:N BuildShare (ou 1:1 conforme estrategia simplificada)
- BuildSlot N:1 Champion

## Regras de dominio

### Regras atuais

- Champion e identificado internamente por id string (cuid).
- Trait e associada por tabela de juncao ChampionTrait.
- Busca de campeoes suporta:
  - listagem paginada (skip/take)
  - filtro textual por nome (contains insensitive)
  - busca por id

### Regras de evolucao futura

- Traits ativas sao calculadas a partir dos campeoes da composicao.
- Thresholds de trait pertencem ao dominio e nao ao componente visual.
- Compartilhamento de build deve usar token opaco unico.

## O que e dado estatico

Dados relativamente estaveis por set/patch:

- catalogo de Champion
- catalogo de Trait
- metadados de habilidade e stats base
- recomendacoes de item importadas de fonte externa

## O que e estado da composicao

Estado transitorio da sessao do usuario:

- quais campeoes estao no board agora
- ordem/posicionamento atual
- itens selecionados no momento
- filtros de visualizacao da interface

Esse estado pode existir apenas no front-end ate o usuario decidir salvar.

## O que e dado persistido

Dados que precisam sobreviver a sessao:

- catalogo base do jogo (importado)
- builds salvas
- vinculos de compartilhamento por token opaco
- (futuro) dados de usuario

## O que e dado derivado

Dados calculados em tempo de execucao:

- traits ativas da composicao
- contagem de unidades por trait
- validacoes de consistencia da build
- agregados de interface (ex.: custo total da composicao)

## Diferencas importantes

### Campeao do jogo vs campeao na composicao atual

- Campeao do jogo: registro de catalogo persistido (Champion).
- Campeao na composicao: selecao temporaria ou persistida em BuildSlot referenciando Champion.

### Trait cadastrada vs trait ativa

- Trait cadastrada: entidade Trait no catalogo.
- Trait ativa: resultado de calculo sobre campeoes presentes no board.

### Dados permanentes do jogo vs estado transitorio da UI

- Permanentes: Champion, Trait, stats e dados importados.
- Transitorios: selecoes, pagina atual, filtros, hover, ordenacao visual.

## Separacao entre dominio, interface e infraestrutura

### Dominio (regra de negocio TFT)

- calcular traits ativas e thresholds
- validar composicao
- regras de consistencia de Build e BuildSlot

### Interface (regra de apresentacao)

- layout do board
- cards de campeao
- filtros de busca
- estados de loading, erro e vazio

### Infraestrutura

- API HTTP (Express)
- persistencia (Prisma/PostgreSQL)
- importacao de dados externos
- CORS, variaveis de ambiente, deploy e docker

## Decisoes para evitar acoplamento

- Nao acoplar componentes React ao rawJson do banco.
- Nao usar resposta externa diretamente no dominio interno; sempre mapear.
- Nao confundir DTO de API com model Prisma.
- Nao tratar regra de trait ativa como detalhe de tela; e regra de dominio.

## Exemplos narrativos de uso

### Exemplo 1: Consulta de campeoes

1. Front chama GET /champions?name=jinx&skip=0&take=25.
2. Controller valida query basica e chama service.
3. Service consulta repositorio Prisma.
4. Front recebe dados para renderizar lista.

### Exemplo 2: Montagem de composicao (futuro)

1. Usuario adiciona campeoes no board.
2. Estado local atualiza BuildDraft.
3. Regra de dominio calcula traits ativas.
4. UI exibe badges/thresholds ativos.

### Exemplo 3: Compartilhamento por token opaco (futuro)

1. Usuario salva build.
2. API cria BuildShare com token unico opaco.
3. Sistema retorna URL publica com token.
4. Outro usuario acessa URL e visualiza build resolvida por token.
