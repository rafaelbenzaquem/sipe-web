 # SipeWeb

 Aplicação frontend do Sistema Integrado de Ponto Eletrônico (SIPE) da Justiça Federal de Roraima (JFRR), responsável por autenticação, gestão de usuários e fluxo completo de registros de ponto (consulta, atualização, pedidos de alteração e aprovação).

 Gerado com [Angular CLI](https://github.com/angular/angular-cli) v20.x.

 ## Pré-requisitos

 - Node.js >= 18 (recomendado Node 20 ou 22)
 - npm >= 8
 - Docker (opcional, para containerização)

 ## Instalação

 1. Clone este repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd sipe-web
    ```
 2. Instale as dependências:
    ```bash
    npm install
    ```

 ## Configuração de Ambientes

 As variáveis de ambiente do frontend são definidas em `src/environments` e utilizadas em tempo de build. Os arquivos padrão são:

 - `src/environments/environment.development.ts`
 - `src/environments/environment.production.ts`

 Chaves disponíveis e valores padrão atuais:

 - `SIPE_WEB_URL`
   - Dev: `http://localhost:4200`
   - Prod: `http://172.29.4.26`
 - `SIPE_API_URL` (Backend SIPE API)
   - Dev: `http://localhost:8000`
   - Prod: `http://172.29.4.26:8084`
 - `SIPE_AUTH_URL` (Servidor de Autenticação/OIDC)
   - Dev: `http://localhost:9001`
   - Prod: `http://172.29.4.26:9000`

 Observações:
 - A configuração de substituição de arquivos por ambiente está em `angular.json` (fileReplacements).
 - O aplicativo utiliza OAuth 2.1/OpenID Connect via `angular-oauth2-oidc`. Os endpoints de autorização, token, userinfo e logout são derivados de `SIPE_AUTH_URL` em `src/app/auth/auth.code.flow.config.ts`.

 ## Execução em Desenvolvimento

 Inicie o servidor de desenvolvimento:
 ```bash
 npm start
 # ou
 ng serve
 ```
 Acesse em `http://localhost:4200`.

 Autenticação (dev): garanta que os serviços de API (`SIPE_API_URL`) e de autenticação (`SIPE_AUTH_URL`) estejam acessíveis conforme os valores de `environment.development.ts`.

 ## Build para Produção

 Gere os artefatos otimizados:
 ```bash
 npm run build -- --configuration production
 ```
 Saída padrão do Angular 20: `dist/sipe-web/browser`.

 ## Execução com Docker

 1. Construa a imagem:
    ```bash
    docker build -t sipe-web .
    ```
 2. Execute o container (Nginx servindo os estáticos):
    ```bash
    docker run -d -p 80:80 --name sipe-web sipe-web
    ```
 Acesse em `http://localhost` ou conforme a porta/host do servidor.

 Notas do Docker:
 - O `dockerfile` usa multi-stage build (Node 22 para build e Nginx para servir).
 - A cópia para o Nginx aponta para `dist/sipe-web/browser`, consistente com Angular 20.

 ## Funcionalidades Principais

 - Autenticação e autorização com OAuth2/OIDC (PKCE) usando `angular-oauth2-oidc`.
 - Gestão de usuários: cadastro/consulta, paginação e filtros; edição de perfil via diálogo.
 - Relatórios e gestão de ponto:
   - Relatório de pontos pendentes por período, com seleção de intervalo padrão (início do mês atual ou anterior).
   - Tabela de pontos com registros de entrada/saída e totais.
   - Diálogo de atualização de registros (UI de "atualização") com:
     - Adição de novos registros.
     - Remoção de registros do usuário.
     - Reordenação (mover para cima/baixo).
     - Edição de hora e sentido (Entrada/Saída) em registros personalizados.
     - Ativação/desativação de registros importados do sistema de acesso.
     - Filtros (ativos, inativos, ambos) e botão de reset (rollback) antes de salvar.
   - Integração automática: ao salvar alterações, o relatório/tabela é recarregado.
 - Fluxo de pedidos de alteração e aprovação:
   - Emissão de pedido de alteração de ponto com justificativa.
   - Tela de controle de aprovação que exibe, lado a lado, o registro "antes" e "depois" de cada alteração para conferência.
   - Ações de aprovar/rejeitar com registro de aprovador e data de aprovação.
 - UI responsiva com Angular Material e Flex-Layout.
 - Locale pt-BR e manipulação de data/hora com Moment.js.

 ## Tecnologias Utilizadas

 - Angular 20, TypeScript, RxJS
 - Angular Material & `@angular/flex-layout`
 - `angular-oauth2-oidc` (OIDC/OAuth2)
 - Moment.js & `@angular/material-moment-adapter`
 - Docker & Nginx (build/servir produção)
 - Karma + Jasmine (testes unitários)

 ## Testes

 - Unitários:
   ```bash
   npm test
   # ou
   ng test
   ```

 ## Estrutura do Projeto (resumo)

 ```
 .
 ├── src/app                     Código-fonte Angular
 │   ├── auth                    Configuração OIDC (`auth.code.flow.config.ts`)
 │   ├── ponto                   Serviços e UI de relatórios de ponto
 │   │   └── ui/relatorio-pontos-pendentes   Relatório por período
 │   ├── registro                Modelos/serviços e UI de registros de ponto
 │   │   ├── ui/aprovacao        Diálogo de aprovação
 │   │   └── ui/controle-aprovacao  Controle detalhado (antes/depois)
 │   ├── alteracao/pedido        Fluxo de pedidos de alteração de ponto
 │   ├── usuario                 Cadastro e gerenciamento de usuários
 │   └── check-box               Componente customizado
 ├── src/environments            Configurações por ambiente
 ├── public                      Imagens e estáticos
 ├── dockerfile                  Dockerfile de produção
 ├── angular.json                Configuração do Angular CLI
 └── package.json                Scripts npm e dependências
 ```

 ## Solução de Problemas (Troubleshooting)

 - Erro de CORS ao chamar a API: verifique `SIPE_API_URL` e se o servidor permite a origem do `SIPE_WEB_URL`.
 - Loop/erro de login: confira `SIPE_AUTH_URL`, `SIPE_WEB_URL` e as URIs de redirecionamento cadastradas no provedor OIDC.
 - Tela em branco após build: assegure que o Nginx está servindo de `dist/sipe-web/browser` e que o base-href (se necessário) está correto.
 - Mismatch de versões Angular/CLI: este projeto usa Angular 20; use `@angular/cli@^20` localmente.

 ## Contribuição

 Pull requests e issues são bem-vindos. Siga o padrão de commits e abra PRs com descrição do contexto e screenshots quando aplicável.

 ## Licença

 Projeto privado (`"private": true` no `package.json`). Defina uma licença caso o projeto seja tornado público.
