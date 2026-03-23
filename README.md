# TFT Build Planner

> Planejador full stack para montar composições de Teamfight Tactics (TFT), visualizar sinergias e evoluir para compartilhamento de builds por link.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-TS-339933?logo=node.js&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
</p>

---

## Hero visual

![TFT Build Planner - preview](./docs/assets/tft-build-planner-hero.png)
**Legenda:** visão geral do planner em execução.
[TODO: adicionar screenshot desktop]
[TODO: adicionar GIF do fluxo de montagem da composição]

---

## Links rápidos

- Deploy: [TODO: adicionar link de deploy]
- Requisitos do sistema: [docs/06-requisitos.md](./docs/06-requisitos.md)
- Roadmap e fluxo de trabalho: [docs/07-roadmap.md](./docs/07-roadmap.md)
- Documentação de arquitetura: [docs/02-arquitetura.md](./docs/02-arquitetura.md)
- API (contratos): [docs/03-api.md](./docs/03-api.md)
- Banco/modelagem: [docs/04-banco.md](./docs/04-banco.md)
- ADRs: [docs/adr](./docs/adr)
- GitHub do autor: [TODO: adicionar link do GitHub]
- LinkedIn do autor: [TODO: adicionar link do LinkedIn]

---

## Problema que o projeto resolve

Jogadores de TFT costumam alternar entre múltiplas fontes para estudar comps, traits e itens.
Isso aumenta fricção, dificulta comparação de variações e atrapalha o compartilhamento de builds.

### Como a solução foi pensada

O projeto foi desenhado para separar claramente:

- **interface** (experiência visual e interação),
- **domínio** (regras do TFT: composição, traits, validações),
- **persistência/infraestrutura** (API, banco, integração de dados).

Essa separação evita acoplamento precoce e prepara o sistema para evoluir com segurança.

---

## Demonstração do produto (fluxo-alvo)

1. Selecionar campeões.
2. Montar composição no board.
3. Visualizar traits ativas.
4. Acompanhar estado atual da build.
5. Salvar e compartilhar build por link.

> Estado atual: catálogo de campeões já disponível via API e exibido no front-end; board, traits, persistência de build e compartilhamento seguem em evolução do MVP.

---

## Funcionalidades

### Implementado hoje

- ✅ API para listar campeões com paginação e filtro por nome.
- ✅ API para buscar campeão por ID.
- ✅ Catálogo de campeões/traits persistido em PostgreSQL com Prisma.
- ✅ Front-end inicial consumindo `/champions` com React Query.
- ✅ CORS configurado para comunicação front-back em desenvolvimento.

### Escopo do MVP (em implementação)

- 🟡 Board interativo para montar composição.
- 🟡 Cálculo de traits ativas.
- 🟡 Persistência de builds (`Build` e `BuildSlot`).
- 🟡 Compartilhamento de build com **token opaco**.

### Evolução futura (pós-MVP)

- 🔵 Autenticação e histórico por usuário.
- 🔵 Filtros e busca avançada no planner.
- 🔵 Estatísticas de builds.
- 🔵 Adapters para integração com fontes oficiais do ecossistema Riot/TFT.

---

## Stack tecnológica (com contexto)

| Camada            | Tecnologia                     | Por que foi escolhida                                             |
| ----------------- | ------------------------------ | ----------------------------------------------------------------- |
| Front-end         | React + TypeScript + Vite      | UI interativa com tipagem forte e ciclo de desenvolvimento rápido |
| Estilo            | Tailwind CSS                   | Velocidade de construção com consistência visual e responsividade |
| Estado de dados   | TanStack React Query           | Gestão de cache, loading, erro e sincronização de dados HTTP      |
| Back-end          | Node.js + TypeScript + Express | API simples, didática e sustentável para evolução incremental     |
| ORM               | Prisma                         | Modelagem relacional clara + client tipado                        |
| Banco             | PostgreSQL                     | Persistência relacional robusta para domínio do projeto           |
| Execução back-end | Docker                         | Isolamento de ambiente e consistência entre máquinas              |
| Deploy front-end  | Vercel                         | Publicação simples para aplicação web estática                    |

---

## Arquitetura em alto nível

A arquitetura foi definida para responder aos requisitos funcionais do MVP e às metas de qualidade (consistência, segurança básica, manutenção e evolução).
Por isso, os documentos de arquitetura e banco não existem isolados: eles derivam do escopo funcional e dos requisitos não funcionais formalizados no projeto.

- **Front-end** consome API HTTP e organiza estado de UI/composição.
- **Back-end** separa rotas, controllers, services e acesso a dados.
- **Banco** guarda catálogo e, no MVP completo, builds compartilháveis.
- **Integrações externas** entram por adapters para não contaminar o domínio interno.

```mermaid
flowchart LR
  U[Usuario] --> W[Web App - React]
  W --> A[API - Node/Express]
  A --> P[(PostgreSQL)]
  E[Fontes externas TFT<br/>evolução futura] --> AD[Adapters]
  AD --> A
```

---

## Documentação técnica

- [Visão geral](./docs/00-visao-geral.md)
- [Domínio TFT](./docs/01-dominio-tft.md)
- [Arquitetura](./docs/02-arquitetura.md)
- [API](./docs/03-api.md)
- [Banco de dados](./docs/04-banco.md)
- [Deploy](./docs/05-deploy.md)
- [Requisitos](./docs/06-requisitos.md)
- [Roadmap](./docs/07-roadmap.md)
- [ADRs](./docs/adr)

### Decisões arquiteturais registradas

- [ADR-001: Arquitetura inicial e separação de responsabilidades](./docs/adr/ADR-001-arquitetura-inicial-do-projeto.md)
- [ADR-002: Separação entre dados do jogo, domínio e integrações](./docs/adr/ADR-002-separacao-entre-dados-do-jogo-dominio-e-integracoes.md)
- [ADR-003: Compartilhamento por token opaco](./docs/adr/ADR-003-estrategia-de-compartilhamento-de-builds.md)

---

## Escopo e requisitos

O escopo do MVP está centrado em montar composições, calcular traits ativas, persistir builds e compartilhar por link seguro. A implementação atual já cobre a base de catálogo e API, enquanto as capacidades centrais de planner avançam em etapas incrementais.

O projeto mantém requisitos funcionais, requisitos não funcionais, user stories e critérios de aceitação formalizados para orientar as entregas. Isso reduz ambiguidade entre o que é esperado do produto e o que precisa ser validado tecnicamente.

Na prática, esse eixo de requisitos fortalece decisões de modelagem, contratos de API e organização de camadas, além de facilitar revisão de escopo e priorização de roadmap sem perder consistência arquitetural.

Os detalhes completos estão em [docs/06-requisitos.md](./docs/06-requisitos.md).

---

## Desafios técnicos e aprendizado

Este projeto foi estruturado para exercitar engenharia de software real:

- Modelar um domínio de jogo sem acoplar a regra do TFT à UI.
- Separar **dados estáticos** do jogo de **estado transitório** da composição.
- Definir contratos API claros sem confundir DTO, entidade e tipo de interface.
- Preparar persistência de builds e compartilhamento sem expor detalhes internos.
- Organizar camadas para evoluir integrações futuras com baixo impacto.
- Manter componentes pequenos e regras de negócio testáveis.

Não é uma documentação criada apenas como vitrine: é um exercício prático de engenharia de software com rastreabilidade entre necessidade, decisão técnica e implementação.

---

## Estrutura do repositório

```text
tft_build_planner/
├─ client/                    # Front-end (React + Vite + TS + Tailwind)
│  ├─ src/
│  │  ├─ components/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  └─ scripts/                # utilitários de coleta/transformação de dados
├─ server/                    # Back-end (Node + TS + Express + Prisma)
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  └─ app.ts
│  └─ scripts/                # seed/import de dados
└─ docs/                      # documentação técnica e ADRs
   ├─ 00-visao-geral.md
   ├─ 01-dominio-tft.md
   ├─ 02-arquitetura.md
   ├─ 03-api.md
   ├─ 04-banco.md
   ├─ 05-deploy.md
   ├─ 06-requisitos.md
  ├─ 07-roadmap.md
   └─ adr/
```

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (local ou remoto)
- Docker (opcional, para banco/back-end conforme sua estratégia)

### 1) Clonar o repositório

```bash
git clone [TODO: URL do repositório]
cd tft_build_planner
```

### 2) Instalar dependências

```bash
cd client && npm install
cd ../server && npm install
```

### 3) Configurar variáveis de ambiente (back-end)

Crie `.env` com:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### 4) Aplicar schema/migrations e seed

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run seed:set16
```

### 5) Subir back-end

```bash
cd server
npm run dev
```

### 6) Subir front-end

```bash
cd client
npm run dev
```

Acesse:

- Front-end: `http://localhost:5173`
- API: `http://localhost:3000/champions`

> [TODO: adicionar `docker-compose.yml` para subir API + DB com um comando]

---

## Variáveis de ambiente

### Back-end (privadas)

- `DATABASE_URL`: conexão com PostgreSQL.
- `PORT`: porta da API.
- `CORS_ORIGIN`: origem permitida do front-end.
- `[TODO]` chaves de integrações externas futuras.

### Front-end (públicas)

- `VITE_API_URL`: URL base da API.
- Somente variáveis com prefixo `VITE_` devem ir para o cliente.

### Regra de segurança

- Nunca expor credenciais, secrets ou tokens sensíveis no front-end.
- `.env` deve ficar fora do versionamento.

---

## Qualidade e engenharia

Princípios que guiam o projeto:

- Requisitos não funcionais tratados desde o início (estabilidade, manutenibilidade e segurança básica).
- Separação de responsabilidades entre interface, domínio e infraestrutura.
- Validação de entrada no back-end e tratamento consistente de erros.
- Regras de domínio organizadas para testabilidade e evolução incremental.
- Rastreabilidade entre requisito, decisão arquitetural (ADR) e implementação.
- Documentação técnica viva para apoiar manutenção e onboarding.

---

## Roadmap

- [ ] Finalizar board interativo do planner.
- [ ] Implementar cálculo de traits ativas.
- [ ] Persistir builds (`Build` e `BuildSlot`).
- [ ] Gerar e resolver links compartilháveis por token opaco.
- [ ] Melhorar filtros e busca de campeões/traits.
- [ ] Evoluir para autenticação e histórico.
- [ ] Adicionar estatísticas de composição.
- [ ] Preparar adapters para dados oficiais do ecossistema TFT.

---

## Autor

**Gianluca Loureço Alves**

- GitHub: [https://github.com/GianlucaAlves]
- LinkedIn: [https://linkedin.com/in/gianluca-alves]
