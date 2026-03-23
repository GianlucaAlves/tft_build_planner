# Deploy e Operacao Inicial

## Visao geral do ambiente

Arquitetura alvo de execucao:

- Front-end estatico em Vercel.
- Back-end API em container Docker.
- Banco PostgreSQL gerenciado ou self-hosted.

## Separacao front-end e back-end

- Front-end: distribuicao estavel, CDN e deploy rapido na Vercel.
- Back-end: ciclo proprio de runtime, seguranca e conexao com banco.

Essa separacao facilita aprendizado de arquitetura real sem complexidade excessiva.

## Por que front-end na Vercel

- fluxo natural para apps Vite/React;
- deploy simples e rapido;
- preview por branch;
- bom para portifolio e iteracao.

## Por que back-end em Docker

- ambiente reproduzivel em qualquer maquina;
- isolamento de dependencias;
- caminho claro para evoluir para cloud sem mudar stack;
- bom ponto de aprendizado para operacao e deploy.

## Conexao com PostgreSQL

- DATABASE_URL no back-end define string de conexao.
- Prisma usa essa variavel para migrations, seed e runtime.

Boas praticas:

- nao hardcode de credenciais;
- usar usuario com privilegios minimos quando possivel;
- separar banco de desenvolvimento e producao.

## Variaveis de ambiente

### Privadas (apenas back-end)

- DATABASE_URL
- API keys de integracoes externas (futuras)
- segredos de assinatura/token internos

### Publicas (front-end)

- apenas configuracoes nao sensiveis.
- em Vite, variaveis publicas tipicamente usam prefixo VITE\_.

Regra obrigatoria:

- qualquer credencial, segredo ou chave de servidor NUNCA vai para o cliente.

## Seguranca basica de configuracao

- manter .env fora do versionamento.
- revisar logs para nao expor dados sensiveis.
- configurar CORS com origens permitidas (em producao, evitar cors aberto geral).
- retornar mensagens de erro seguras (sem stack trace bruto para cliente).

## Fluxo de deploy inicial sugerido

1. rodar testes basicos locais e lint.
2. aplicar migration no banco alvo.
3. publicar imagem do back-end (ou buildar no host).
4. subir container back-end com variaveis corretas.
5. publicar front-end na Vercel apontando para URL publica da API.
6. validar healthcheck e rotas principais.

## Riscos operacionais iniciais

- CORS mal configurado bloqueando front.
- DATABASE_URL incorreta em ambiente de deploy.
- divergencia de migration entre ambientes.
- indisponibilidade do back-end derrubando funcionalidades de consulta.

Mitigacoes:

- checklist por ambiente (dev, staging, prod).
- script de healthcheck simples.
- logs minimos estruturados para diagnostico.

## Boa para aprender vs melhor para producao

### Boa para aprender (agora)

- deploy separado simples (Vercel + container unico API).
- configuracao manual de variaveis e migrations.

### Melhor para producao (depois)

- CI/CD automatizado com gates.
- observabilidade (metricas, tracing, alertas).
- politica de secret management dedicada.
- estrategia de rollback automatizado.

## Evolucao futura

- pipeline CI/CD com testes e validacao de migration.
- monitoramento de erro e performance.
- cache para endpoints de catalogo.
- hardening adicional de seguranca (rate limit, headers, WAF se necessario).
