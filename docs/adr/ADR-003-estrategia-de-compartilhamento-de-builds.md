# ADR-003 - Estrategia inicial de compartilhamento de builds por link

## Status

Aceito

## Contexto

O projeto precisa de compartilhamento de build no MVP. A decisao de produto para o MVP e usar token opaco.

Objetivos da funcionalidade:

- gerar link simples para compartilhar build;
- evitar exposicao de detalhes internos na URL;
- manter implementacao didatica e segura.

## Problema

Qual estrategia de identificacao de compartilhamento usar no MVP: slug semantico ou token opaco?

## Decisao

Usar token opaco unico para compartilhamento.

Formato conceitual:

- criar registro BuildShare vinculado a Build.
- gerar shareToken aleatorio e unico.
- link publico resolve por token: /shared/:token.

## Alternativas consideradas

1. Slug semantico legivel (ex.: invoker-6-xyz).

- Pro: URL mais amigavel visualmente.
- Contra: risco de colisao, ambiguidades de naming, maior complexidade de normalizacao.

2. Expor id interno da build.

- Pro: simplicidade tecnica.
- Contra: vaza estrutura interna e piora seguranca por enumeracao.

## Consequencias positivas

- URL nao revela detalhes internos.
- Menor chance de conflito de nomes.
- Regra simples para implementar e ensinar.

## Consequencias negativas

- URL menos amigavel para leitura humana.
- Pode exigir camada extra se no futuro quiser slug amigavel.

## Impacto no aprendizado

Alto:

- ensina separacao entre identificador interno e identificador publico.
- reforca preocupacao de seguranca basica (nao expor ids internos).
- mantem foco do MVP em fluxo funcional.

## Quando revisar esta decisao

- Se houver forte demanda de UX por links semanticos.
- Se estrategia de marketing/SEO exigir URLs descritivas.

Nessa revisao, pode-se adotar abordagem hibrida:

- manter token opaco como chave canonica;
- adicionar slug opcional apenas para exibicao.
