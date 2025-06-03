 # SipeWeb

 Aplicação frontend do Sistema Integrado de Ponto Eletrônico (SIPE) da Justiça Federal de Roraima (JFRR), para gerenciamento de usuários e relatórios de ponto.

 Gerado com [Angular CLI](https://github.com/angular/angular-cli) v19.2.7.

 ## Pré-requisitos

 - Node.js >= 18
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

 ## Configuração

 As URLs da API devem ser ajustadas em `src/environments`:

 - **Desenvolvimento**: `src/environments/environment.development.ts` (padrão `http://localhost:8084`)
 - **Produção**: `src/environments/environment.production.ts` (padrão `http://192.168.100.7:8084`)

 ## Execução em Desenvolvimento

 Inicie o servidor de desenvolvimento:
 ```bash
 npm start
 # ou
 ng serve
 ```
 Acesse em `http://localhost:4200`.

 ## Build para Produção

 Gere os artefatos otimizados:
 ```bash
 npm run build -- --configuration production
 ```
 Os arquivos compilados serão gerados em `dist/sipe-web`.

 ## Execução com Docker

 1. Construa a imagem:
    ```bash
    docker build -t sipe-web .
    ```
 2. Execute o container:
    ```bash
    docker run -d -p 80:80 --name sipe-web sipe-web
    ```
 Acesse em `http://localhost`.

 ## Funcionalidades Principais

 - Cadastro e consulta de usuários com paginação e filtros.
 - Atualização de perfil de usuário via diálogo.
 - Relatórios de pontos diários com visualização e edição de registros:
   - Exibição tabular de registros de entrada/saída.
   - Edição de registros via diálogo com:
     - Adição de novos registros.
     - Remoção de registros criados pelo usuário.
     - Movimentação (ordenar para cima/baixo) de registros.
     - Edição de horário e sentido (Entrada/Saída) para registros personalizados.
     - Ativação/desativação de registros importados do sistema de acesso.
     - Filtros para exibir apenas registros ativos, inativos ou ambos.
     - Botão de reset (rollback) para desfazer alterações antes de salvar.
   - Integração automática: ao salvar registros, a lista de pontos e totais é recarregada.
 - Interface responsiva com Angular Material e Flex-Layout.
 - Locale em Português (pt-BR) e formatação de data com Moment.js.

 ## Tecnologias Utilizadas

 - Angular 19, TypeScript, RxJS
 - Angular Material & @angular/flex-layout
 - Moment.js & @angular/material-moment-adapter
 - Docker & Nginx (para build de produção)
 - Karma + Jasmine (testes unitários)
 - (E2E: escolha seu framework preferido)

 ## Testes

 - **Unitários**:
   ```bash
   ng test
   ```
 - **E2E**:
   ```bash
   ng e2e
   ```

 ## Estrutura do Projeto

 ```
 .
 ├── src/app           Fonte Angular
 │   ├── registro      Modelos, serviços e UI de registros de ponto
 │   │   └── ui/atualizacao  Diálogo de edição de registros (add, remove, reset, filtros)
 │   ├── ponto         Módulo de relatórios de ponto (relatório, tabela, atualização via diálogo)
 │   ├── usuario       Cadastro e gerenciamento de usuários
 │   └── check-box     Componente customizado de checkbox
 ├── src/environments  Configurações por ambiente (API URLs)
 ├── public            Imagens e ativos estáticos
 ├── dockerfile        Dockerfile para produção
 ├── angular.json      Configurações do Angular CLI
 └── package.json      Scripts npm e dependências
 ```

 ## Contribuição

 Pull requests e issues são bem-vindos. Sinta-se à vontade para contribuir!

 ## Licença

 Este projeto é privado (`"private": true` no `package.json`). Defina uma licença caso seja aberto ao público.