# Visao Geral do Projeto

## Visao do produto

O TFT Build Planner e uma aplicacao web full stack para montar composicoes de Teamfight Tactics (TFT) em um board interativo, visualizar sinergias (traits), analisar campeoes e itens recomendados, e compartilhar builds por link.

O projeto tem dupla finalidade:

- produto util para comunidade de TFT;
- plataforma de aprendizado pratico de engenharia de software moderna.

## Problema que o produto resolve

Jogadores de TFT normalmente alternam entre varias fontes para decidir composicao, sinergia, posicionamento e itens. Isso gera friccao e dificulta experimentar variacoes de build rapidamente.

Este projeto busca centralizar esse fluxo:

- visualizar dados relevantes de campeoes;
- montar composicoes de forma visual;
- obter leitura clara de traits ativas;
- compartilhar build com outras pessoas via link.

## Publico-alvo

- Jogadores iniciantes e intermediarios de TFT que querem estudar composicoes.
- Jogadores avancados que querem iterar builds e compartilhar rapidamente.
- Recrutadores e equipe tecnica (portifolio), avaliando capacidade de arquitetura e engenharia.

## Objetivos do projeto

- Entregar um MVP funcional de planner de composicoes TFT.
- Criar base arquitetural simples, didatica e sustentavel.
- Permitir evolucao para autenticacao, historico, estatisticas e integracoes externas sem reescrita total.

## Objetivos de aprendizado

- Front-end: React + TypeScript + Vite + Tailwind com foco em componentizacao, estado, renderizacao condicional e UX incremental.
- Back-end: Node.js + TypeScript com separacao entre rota, controller, validacao e service.
- Dados: PostgreSQL + Prisma com modelagem relacional coerente, indices e migracoes.
- Arquitetura: separar dominio, interface e infraestrutura desde o inicio.
- Seguranca: validacao de entrada, erro consistente, CORS e uso correto de variaveis de ambiente.

## Estado atual do projeto (marco de referencia)

Implementado hoje:

- API de campeoes com listagem, busca por nome e busca por id.
- Persistencia de catalogo de jogo no banco para Champion, Trait, Ability, ChampionStat e ChampionRecommendedItem.
- Front-end inicial consumindo /champions e exibindo lista de nomes.

Nao implementado ainda:

- Board interativo de composicao.
- Calculo de traits ativas por composicao.
- Persistencia de Build e BuildSlot.
- Compartilhamento por token opaco.

## MVP

No contexto deste projeto, o MVP e:

- listar e consultar campeoes de forma confiavel;
- montar composicao no front-end;
- calcular e exibir traits ativas;
- salvar build;
- compartilhar build por token opaco.

### O que e essencial no MVP

- clareza arquitetural;
- separacao de responsabilidades;
- contratos de API simples e estaveis;
- seguranca basica correta;
- experiencia minima de uso para montar e compartilhar build.

## Evolucao futura

Itens planejados para apos estabilizacao do MVP:

- autenticacao e autorizacao;
- historico de builds por usuario;
- estatisticas de uso e performance de composicoes;
- integracao com dados oficiais do ecossistema Riot/TFT via adapters;
- cache e observabilidade mais avancados;
- CI/CD com gates de qualidade e testes automatizados amplos.

## Fora de escopo inicial

- sistema de ranking competitivo proprio;
- recomendacao automatica por IA em tempo real;
- sincronizacao oficial com conta Riot;
- multi-tenant e recursos enterprise;
- arquitetura distribuida complexa (microservices).

## Stakeholders

- Dono do produto e estudante (autor do projeto).
- Usuarios jogadores de TFT.
- Recrutadores e avaliadores tecnicos.
- Comunidade que pode consumir o projeto como referencia de estudo.

## Principais fluxos de uso

1. Usuario abre o planner.
2. Usuario busca e seleciona campeoes.
3. Usuario monta composicao no board.
4. Sistema calcula traits ativas e apresenta estado da build.
5. Usuario salva build.
6. Sistema gera link de compartilhamento por token opaco.
7. Outro usuario acessa o link e visualiza a build.

## Restricoes tecnicas

- Front-end em React + TypeScript + Vite + Tailwind.
- Back-end em Node.js + TypeScript.
- Banco em PostgreSQL via Prisma.
- Front-end deployado na Vercel.
- Back-end executado em Docker.
- Integracoes externas devem entrar por camada de adapter, sem contaminar dominio.

## Metas de qualidade

Prioridade alta no inicio:

- Claridade: codigo legivel e nomes consistentes.
- Manutenibilidade: camadas simples e responsabilidade unica.
- Testabilidade: regras de dominio em funcoes puras quando possivel.
- Seguranca basica: validacao de entrada e nenhum segredo no cliente.
- Separacao de responsabilidades: dominio, interface e infraestrutura desacoplados.

## Riscos iniciais e mitigacoes

- Risco: acoplamento precoce da UI ao formato cru de dados externos.
  Mitigacao: criar tipos internos de dominio e usar mapeadores/adapters.

- Risco: crescer features sem consolidar base.
  Mitigacao: definir MVP enxuto e concluir fluxo ponta a ponta antes de otimizar.

- Risco: mistura de regra de negocio no componente visual.
  Mitigacao: extrair calculos de dominio para camada propria e funcoes puras.

- Risco: regressao por falta de contratos claros.
  Mitigacao: documentar API, erros e DTOs desde o inicio.

## Glossario inicial

- Champion: entidade de campeao do catalogo do jogo.
- Trait: sinergia tematizada do TFT (ex.: Invoker, Bruiser).
- Build: composicao salva pelo usuario.
- BuildSlot: posicao/unidade dentro da build.
- Trait ativa: trait que atingiu ao menos um threshold na composicao atual.
- Token opaco: identificador nao semantico usado em link de compartilhamento.
- Dominio: regras do jogo e comportamento de build.
- Interface: experiencia visual, interacao e estado de tela.
- Infraestrutura: banco, API HTTP, deploy, variaveis de ambiente e integracoes externas.

## Documentos relacionados

- [Arquitetura](./02-arquitetura.md)
- [API](./03-api.md)
- [Banco](./04-banco.md)
- [Deploy](./05-deploy.md)
- [Requisitos](./06-requisitos.md)
- [Roadmap e fluxo de trabalho](./07-roadmap.md)
