# API

## Principios de design da API

- REST simples e previsivel.
- JSON como formato padrao.
- Contratos claros entre camada HTTP e dominio.
- Erros consistentes e seguros.
- Evolucao incremental sem quebrar consumidores.

## Convencoes de rotas

- Prefixo recomendado: /api/v1 (evolucao futura; hoje ainda sem prefixo no codigo atual).
- Recursos no plural: /champions, /traits, /items, /builds.
- Identificadores no path quando a consulta e direta.
- Filtros e paginação em query params.

## Versionamento

- Estado atual: rotas sem versao explicita.
- Direcao recomendada: iniciar /api/v1 antes de abrir endpoints de build para evitar migrações dolorosas.

## Formato de resposta de sucesso

Padrao recomendado:

```json
{
  "data": {},
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

Estado atual implementado:

- endpoints de campeoes retornam array/objeto direto.

## Formato de resposta de erro

Padrao recomendado:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Campeao nao encontrado",
    "details": null
  }
}
```

Estado atual implementado:

- `{ "error": "..." }` em portugues.

## Validacoes esperadas

- Query:
  - `skip >= 0`
  - `take` com limite maximo (ex.: 100)
  - `name` string com tamanho maximo
- Params:
  - `id` string nao vazia
  - `token` com formato esperado
- Body (builds):
  - slots validos
  - championIds existentes
  - sem duplicidade invalida de posicao

## DTO vs Entidade vs Tipo de UI

- DTO: contrato de entrada/saida HTTP (ex.: BuildCreateRequestDTO).
- Entidade: representacao de persistencia/dominio (ex.: Build, BuildSlot, Champion).
- Tipo de UI: estrutura de exibicao local (ex.: PlannerBoardState).

Regra obrigatoria:

- Nao vazar diretamente detalhes internos do banco para o cliente.

## Recursos iniciais e propostos

---

## Endpoints implementados (estado atual)

### GET /champions

- Objetivo: listar campeoes com paginação e filtro opcional por nome.
- Parametros (query):
  - `name` opcional (contains case-insensitive)
  - `skip` opcional (default 0)
  - `take` opcional (default 25)
- Body: nao possui.
- Resposta atual: array de campeoes.
- Erros possiveis:
  - 500 erro interno.
- Observacoes de seguranca:
  - adicionar limite maximo de `take`.
  - validar tipo/tamanho de query.

### GET /champions/:id

- Objetivo: buscar um campeao por id.
- Parametros:
  - path `id` string.
- Body: nao possui.
- Resposta atual: objeto de campeao.
- Erros possiveis:
  - 404 campeao nao encontrado.
  - 500 erro interno.
- Observacoes de seguranca:
  - validar formato/tamanho do id.

---

## Endpoints propostos para o MVP funcional completo

### GET /traits (evolucao futura)

- Objetivo: listar traits do catalogo.
- Parametros: paginação e filtro por nome/slug.
- Resposta: lista de TraitResponseDTO.
- Erros: 400, 500.

### GET /items (evolucao futura)

- Objetivo: listar itens do catalogo.
- Parametros: paginação e filtro.
- Resposta: lista de ItemResponseDTO.
- Erros: 400, 500.

### POST /builds (evolucao futura)

- Objetivo: criar build persistida.
- Body (exemplo):

```json
{
  "name": "Invoker 6 Safe",
  "setCode": "TFT16",
  "slots": [
    { "position": 0, "championId": "cmmv..." },
    { "position": 1, "championId": "cmmx..." }
  ]
}
```

- Resposta:

```json
{
  "data": {
    "id": "build_...",
    "name": "Invoker 6 Safe",
    "slots": [{ "position": 0, "championId": "cmmv..." }]
  }
}
```

- Erros: 400 validacao, 404 champion inexistente, 500.
- Seguranca: validar slots, positions e championIds.

### GET /builds/:id (evolucao futura)

- Objetivo: recuperar build por id interno.
- Erros: 404, 500.
- Seguranca: se houver usuario, aplicar autorizacao.

### POST /builds/:id/share (evolucao futura)

- Objetivo: gerar link de compartilhamento por token opaco.
- Decisao para MVP: token opaco (nao semantico).
- Resposta:

```json
{
  "data": {
    "shareToken": "8fK2aPzQw9Lm",
    "shareUrl": "https://seu-front.vercel.app/shared/8fK2aPzQw9Lm"
  }
}
```

- Erros: 404 build nao encontrada, 409 conflito token raro, 500.
- Seguranca: token aleatorio, unico, sem dados sensiveis embutidos.

### GET /shared/:token (evolucao futura)

- Objetivo: recuperar build compartilhada por token opaco.
- Parametros:
  - path `token`.
- Resposta: BuildSharedResponseDTO.
- Erros: 404 token invalido, 410 expirado (se regra existir), 500.

## O que e calculo no back-end vs exibicao no front-end

### Back-end (dominio/aplicacao)

- validacao de consistencia da build persistida;
- resolucao de build compartilhada por token opaco;
- (recomendado) calculo canonico de traits ativas para consistencia.

### Front-end (interface)

- estados visuais (loading/erro/vazio);
- ordenacao, filtros e apresentacao;
- calculos de exibicao nao criticos.

## O que nao deve vazar do banco

- campos tecnicos internos sem valor de produto;
- estruturas de rawJson sem mapeamento;
- detalhes de integracao externa bruta;
- segredos e configuracoes internas.
