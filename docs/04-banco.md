# Banco de Dados

## Visao geral da persistencia

O projeto usa PostgreSQL com Prisma.

Objetivo da persistencia no estado atual:

- armazenar catalogo de campeoes e traits com dados importados.

Objetivo da persistencia para o MVP funcional completo:

- armazenar build montada pelo usuario;
- armazenar slots da composicao;
- permitir compartilhamento por token opaco.

## Estado atual implementado (schema real)

Modelos existentes:

- Champion
- Trait
- ChampionTrait (juncao N:N)
- ChampionStat
- Ability
- ChampionRecommendedItem

Relacoes implementadas:

- Champion N:N Trait via ChampionTrait
- Champion 1:N ChampionStat
- Champion 1:1 Ability
- Champion 1:N ChampionRecommendedItem

## Entidades que ainda nao precisam ser persistidas no inicio

- estado transitorio da tela (filtros, selecoes temporarias)
- hover, ordenacao visual, pagina em memoria

## Entidades que devem entrar na proxima etapa (evolucao futura)

- Build
- BuildSlot
- BuildShare (token opaco)
- User (quando autenticacao entrar)
- Item (tabela dedicada, se for necessario enriquecer metadados)

## Modelagem relacional proposta (documentacao)

### Build

- id
- name
- setCode
- createdAt, updatedAt
- ownerUserId (nullable no inicio)

### BuildSlot

- id
- buildId (FK -> Build)
- position (indice ou coordenada)
- championId (FK -> Champion)

### BuildShare

- id
- buildId (FK -> Build)
- shareToken (unico, opaco)
- isActive
- expiresAt (opcional)
- createdAt

### Item (opcional de curto prazo)

- id
- apiName (unico)
- name
- iconUrl
- rawJson

## Cardinalidade e justificativa

### Champion N:N Trait

Um campeao possui varias traits e uma trait pertence a varios campeoes.

Implementacao correta: tabela de juncao ChampionTrait.

### Build 1:N BuildSlot

Uma build possui varios slots; cada slot pertence a uma build.

### BuildSlot N:1 Champion

Muitos slots (de builds diferentes) podem apontar para o mesmo campeao.

### Build 1:N BuildShare (ou 1:1 simplificado)

No MVP pode ser 1:1 para simplificar.
Para evolucao futura, 1:N permite rotacao de links e revogacao sem perder historico.

## Unicidade recomendada

- Champion.apiName unico (ja existe).
- Champion.fallbackSlug unico (ja existe).
- Trait.slug unico (ja existe).
- ChampionStat (championId, starLevel) unico (ja existe).
- ChampionRecommendedItem (championId, position) unico (ja existe).
- BuildShare.shareToken unico (futuro).
- BuildSlot (buildId, position) unico (futuro).

## Indices iniciais recomendados

Estado atual:

- Champion(name)
- Trait(name)
- ChampionTrait(traitId)
- ChampionStat(starLevel)
- ChampionRecommendedItem(itemApiName)

Evolucao futura:

- Build(createdAt)
- Build(ownerUserId)
- BuildShare(shareToken)
- BuildSlot(buildId, position)

## Enum, tabela ou campo simples

### Boa para aprender (agora)

- usar campo simples `setCode` em Build (ex.: TFT16).

### Melhor para producao (depois)

- enum controlado de setCode ou tabela SetVersion, caso multiplos ciclos e regras por patch fiquem complexos.

## Estrategia de migrations

- 1 migration por mudanca coesa de modelagem.
- migracao deve refletir decisao arquitetural explicita.
- evitar migrations gigantes com mudancas nao relacionadas.

Sequencia sugerida (futuro proximo):

1. criar Build, BuildSlot, BuildShare.
2. adicionar constraints de unicidade e indices.
3. criar ajuste para Item dedicado (se optar).

## Estrategia de seeds

Estado atual:

- seed de catalogo via script import-metatft-set.mjs usando client/metatft_set_units.json.

Boas praticas:

- manter seed idempotente (upsert) para reexecucao segura.
- versionar dataset por set/patch.
- separar claramente seed de catalogo de seed de dados de teste.

## Integridade e consistencia

- usar FKs com onDelete cascade onde fizer sentido (ja adotado no catalogo).
- validar no back-end referencias de championId em BuildSlot.
- impedir posicoes duplicadas no mesmo board.
- nao persistir valor derivado que pode ficar inconsistente sem necessidade.

## O que merece tabela, enum ou nao persistir

- Tabela: entidades de ciclo de vida proprio (Build, BuildSlot, BuildShare).
- Enum/campo controlado: setCode, status simples.
- Nao persistir inicialmente: resultado derivado de trait ativa por request (pode ser recalculado).

## Papel das tabelas de juncao

ChampionTrait resolve N:N entre Champion e Trait sem redundancia.

Futuro possivel:

- BuildSlotItem para N:N entre slot e item equipado, se a regra de itens por unidade for persistida com maior fidelidade.
