# ADR-001 - Arquitetura inicial do projeto full stack e separacao de responsabilidades

## Status

Aceito

## Contexto

O projeto precisa ser didatico para aprendizado, mas tambem consistente para evolucao de MVP para portfolio real.

Estado atual ja possui:

- API de campeoes com Node + TypeScript + Express + Prisma.
- front React exibindo lista de campeoes.

A decisao precisa orientar o crescimento para build, traits ativas e compartilhamento sem baguncar o codigo.

## Problema

Como organizar o sistema para manter simplicidade inicial e, ao mesmo tempo, preservar manutenibilidade e escalabilidade?

## Decisao

Adotar arquitetura em camadas simples:

- Front-end: componentes de interface + servicos de API.
- Back-end: routes -> controllers -> services -> acesso Prisma.
- Dominio separado de detalhes de interface e infraestrutura.

Diretrizes:

- regra de negocio do TFT nao fica em componente visual;
- validacao de entrada antes de executar regra de negocio;
- contratos HTTP separados de modelos de persistencia.

## Alternativas consideradas

1. Arquitetura monolitica sem separacao clara.

- Pro: mais rapida no curtissimo prazo.
- Contra: degrada manutenibilidade rapidamente.

2. Arquitetura hexagonal completa desde o inicio.

- Pro: excelente para producao complexa.
- Contra: excesso de abstracao para fase de aprendizado inicial.

## Consequencias positivas

- Facilita ensino e entendimento da responsabilidade de cada camada.
- Permite evoluir API sem misturar regra de dominio com HTTP.
- Reduz risco de acoplamento entre front e banco.

## Consequencias negativas

- Exige disciplina para manter padrao entre features.
- Pode parecer mais verboso que abordagem ad hoc.

## Impacto no aprendizado

Muito alto:

- reforca fundamentos de arquitetura;
- torna reproduzivel o raciocinio tecnico;
- facilita explicar decisoes em entrevistas e portfolio.

## Quando revisar esta decisao

- Quando surgirem multiplos modulos de dominio com alta complexidade.
- Quando houver necessidade comprovada de desacoplamento maior (ex.: integracoes simultaneas complexas, multiplos canais).
