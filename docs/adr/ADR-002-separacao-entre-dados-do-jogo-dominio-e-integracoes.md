# ADR-002 - Separacao entre dados estaticos do TFT, regras de dominio e integracoes externas

## Status

Aceito

## Contexto

O projeto usa dados de TFT importados (catalogo de campeoes/traits/stats), e no futuro deve suportar integracoes oficiais do ecossistema Riot/TFT.

Sem separacao clara, ha risco de:

- acoplamento ao formato bruto externo;
- quebra de regra de negocio a cada mudanca de fornecedor;
- dependencia da UI no payload cru de integracao.

## Problema

Como preparar o projeto para evoluir integracoes externas sem contaminar o dominio interno?

## Decisao

Separar explicitamente tres camadas de preocupacao:

1. Dados estaticos do jogo

- catalogo persistido e versionavel (Champion, Trait, etc.).

2. Regras de dominio

- calculo de traits ativas, consistencia de build e demais regras TFT.

3. Integracoes externas

- scripts/adapters de importacao e mapeamento para tipos internos.

Regras de implementacao:

- payload externo nunca atravessa direto para UI;
- mapear para tipos internos antes de persistir/expor;
- manter campos rawJson apenas como apoio tecnico, nao contrato de dominio.

## Alternativas consideradas

1. Consumir payload externo diretamente no front e no back.

- Pro: rapido no inicio.
- Contra: acoplamento alto, manutencao dificil.

2. Persistir somente JSON bruto sem modelo relacional.

- Pro: ingestao simples.
- Contra: consultas ruins, regra de negocio fragil e baixa integridade.

## Consequencias positivas

- Dominio fica estavel mesmo com mudanca da fonte externa.
- API fica mais previsivel para o front.
- Facilita testes de regra de negocio com dados internos controlados.

## Consequencias negativas

- Exige camada de mapeamento/adaptacao adicional.
- Pode aumentar trabalho inicial de modelagem.

## Impacto no aprendizado

Alto:

- ensina adaptacao entre contratos externos e internos;
- ensina a nao confundir integracao com dominio;
- reforca principio de baixo acoplamento.

## Quando revisar esta decisao

- Quando houver necessidade de ingestao quase em tempo real com alto volume.
- Quando o custo de transformacao exigir pipeline dedicado.
