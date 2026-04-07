
# SIPE Web - Sistema Integrado de Ponto Eletrônico

![Angular](https://img.shields.io/badge/Angular-20.0.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Material](https://img.shields.io/badge/Material-20.0.1-purple)
![Version](https://img.shields.io/badge/version-0.9.2-orange)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema web para gestão de ponto eletrônico da Justiça Federal de Roraima, construído com Angular 20 e Angular Material. Permite o registro, consulta e alteração de pontos, além de gerenciamento completo de usuários e geração de relatórios.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Build](#build)
- [Docker](#docker)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Módulos e Componentes](#módulos-e-componentes)
- [Perfis de Acesso](#perfis-de-acesso)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes](#testes)

---

## Funcionalidades

### Autenticação e Autorização
- Login via OAuth2/OIDC (Authorization Code Flow)
- Logout federado com encerramento de sessão no servidor de autenticação
- Controle de acesso baseado em roles (RBAC)
- Guarda de rotas por permissões (`AuthGuard`, `RoleGuard`)
- Detecção e notificação de expiração de sessão
- Extração de perfil e permissões a partir de tokens JWT

### Gestão de Usuários
- Cadastro de novos usuários com validação de formulário
- Consulta com busca por nome, matrícula ou crachá
- Filtro por lotação (unidade organizacional)
- Paginação configurável (25, 50 ou 100 itens por página)
- Edição de dados cadastrais via dialog
- Indicador de pendências por usuário

### Gestão de Ponto
- Registro de ponto eletrônico (entrada/saída)
- Consulta de histórico de pontos por período
- Solicitação de alteração de registro com justificativa
- Aprovação ou rejeição de alterações (para gestores)
- Histórico completo de alterações com valores originais e novos
- Visualização de pendências de aprovação

### Relatórios
- Relatório pessoal por período com download em PDF
- Relatório setorial por lotação ou por diretor
- Filtro por intervalo de datas

---

## Tecnologias

### Core
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| Angular | 20.0.0 | Framework principal |
| TypeScript | 5.8.3 | Linguagem de programação |
| RxJS | 7.8.0 | Programação reativa |

### UI/UX
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| Angular Material | 20.0.1 | Componentes de interface |
| Angular CDK | 20.0.1 | Kit de desenvolvimento de componentes |
| Angular Flex Layout | 15.0.0-beta.42 | Layout responsivo |

### Autenticação
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| angular-oauth2-oidc | 19.0.0 | Integração OAuth2/OIDC |

### Utilitários
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| Moment.js | 2.30.1 | Manipulação de datas |
| UUID | 11.0.2 | Geração de identificadores únicos |

### Testes
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| Jasmine | 5.6.0 | Framework de testes BDD |
| Karma | 6.4.0 | Test runner |
| Karma Coverage | 2.2.0 | Cobertura de código |

### Build e Infraestrutura
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| @angular/build | 20.0.0 | Sistema de build do Angular |
| @angular/cli | 20.0.0 | CLI do Angular |
| Node.js | 22 (Alpine) | Runtime (Docker) |
| Nginx | Alpine | Servidor web em produção (Docker) |

---

## Arquitetura

O SIPE Web segue a arquitetura padrão do Angular com componentes standalone (Angular 20), sem módulos NgModule tradicionais. A aplicação se comunica com:

- **Backend SIPE API** — API REST no padrão HAL/HATEOAS
- **Servidor de Autenticação** — OAuth2/OIDC (ex: Keycloak ou Spring Authorization Server)

### Fluxo de Autenticação

```
Usuário → Login → Servidor OAuth2 → Authorization Code
→ Frontend troca o código por tokens (access + id token)
→ Extrai login e permissões do JWT
→ Requisições à API com access token no header
```

### Formato de Dados
- Datas: formato `DDMMYYYY`
- Horas: formato `HHMM` (sem separador, para a API)
- Respostas da API: HAL/HATEOAS com `_embedded` e `_links`

---

## Pré-requisitos

- **Node.js** >= 18.19.0
- **npm** >= 10.x
- **Angular CLI** >= 20.x (instalação global opcional)

```bash
npm install -g @angular/cli
```

---

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sipe-web

# Instale as dependências
npm install
```

---

## Configuração

As configurações de ambiente estão em `src/environments/`:

| Arquivo | Ambiente |
|---------|----------|
| `environment.ts` | Padrão |
| `environment.development.ts` | Desenvolvimento |
| `environment.production.ts` | Produção |

### Variáveis de ambiente

| Variável | Descrição | Exemplo (dev) |
|----------|-----------|---------------|
| `SIPE_WEB_URL` | URL do frontend | `http://localhost:4200` |
| `SIPE_API_URL` | URL da API backend | `http://localhost:8000` |
| `SIPE_AUTH_URL` | URL do servidor de autenticação | `http://localhost:9001` |
| `SIPE_LOTACAO_PAI` | ID da lotação raiz | `15` |

---

## Execução

```bash
# Desenvolvimento (hot reload)
npm start
# Acesse: http://localhost:4200
```

---

## Build

```bash
# Build de produção
npm run build

# Build em modo watch
npm run watch
```

O build gera os arquivos em `dist/sipe-web/browser/`.

> **Nota:** Os scripts `prestart` e `prebuild` geram automaticamente o arquivo `public/version.json` com a versão atual do projeto.

---

## Docker

### Build da imagem

```bash
docker build -t sipe-web .
```

### Execução do container

```bash
docker run -p 80:80 sipe-web
```

O Dockerfile utiliza build multi-stage:
1. **Stage 1 (build)** — Node.js 22 Alpine: instala dependências e compila a aplicação
2. **Stage 2 (runtime)** — Nginx Alpine: serve os arquivos estáticos gerados

---

## Estrutura do Projeto

```
sipe-web/
├── src/
│   ├── app/
│   │   ├── auth/                   # Autenticação e autorização
│   │   │   ├── auth.service.ts     # Serviço principal de auth
│   │   │   ├── auth.guard.ts       # Guard de autenticação
│   │   │   ├── role.guard.ts       # Guard de roles/permissões
│   │   │   └── session-expired/    # Dialog de sessão expirada
│   │   ├── usuario/                # Gestão de usuários
│   │   │   ├── model/              # Modelos de dados
│   │   │   ├── service/            # Serviços HTTP
│   │   │   └── ui/
│   │   │       ├── consulta/       # Tela de busca de usuários
│   │   │       ├── cadastro/       # Tela de cadastro
│   │   │       └── atualizacao/    # Dialog de edição
│   │   ├── ponto/                  # Gestão de ponto
│   │   │   ├── model/              # Modelos de dados
│   │   │   ├── service/            # Serviços HTTP e relatório
│   │   │   └── ui/
│   │   │       ├── relatorio-pontos/           # Relatório pessoal
│   │   │       ├── relatorio-pontos-pendentes/ # Pendências
│   │   │       └── tabela-pontos/              # Tabela de registros
│   │   ├── registro/               # Registros de ponto
│   │   │   ├── model/              # Modelos de dados
│   │   │   ├── service/            # Serviços HTTP
│   │   │   └── ui/
│   │   │       ├── atualizacao/    # Dialog de edição de registro
│   │   │       ├── aprovacao/      # Dialog de aprovação
│   │   │       ├── controle-aprovacao/ # Dialog de controle
│   │   │       └── timer/          # Componente de entrada de hora
│   │   ├── alteracao/              # Pedidos de alteração
│   │   │   └── pedido/             # Serviço e modelo de pedido
│   │   ├── pagina-inicial/         # Página home / login
│   │   ├── core/                   # Serviços centrais (versão)
│   │   ├── check-box/              # Componente checkbox customizado
│   │   ├── error/                  # Página de erro 403
│   │   ├── app.component.ts        # Componente raiz (layout e sidebar)
│   │   ├── app.routes.ts           # Definição de rotas
│   │   └── app.config.ts           # Configuração da aplicação
│   ├── environments/               # Configurações por ambiente
│   ├── assets/                     # Imagens e logos
│   ├── styles.scss                 # Estilos globais
│   └── main.ts                     # Bootstrap da aplicação
├── public/
│   └── version.json                # Versão gerada no build
├── scripts/
│   └── write-version.cjs           # Script gerador de versão
├── angular.json                    # Configuração do Angular CLI
├── tsconfig.json                   # Configuração do TypeScript
├── package.json                    # Dependências e scripts
└── dockerfile                      # Imagem Docker
```

---

## Módulos e Componentes

### Componentes principais

| Componente | Caminho | Descrição |
|-----------|---------|-----------|
| `AppComponent` | `app/` | Layout raiz com sidebar de navegação |
| `PaginaInicialComponent` | `pagina-inicial/` | Página de entrada / fluxo de login |
| `ConsultaComponent` | `usuario/ui/consulta/` | Busca e listagem de usuários |
| `CadastroComponent` | `usuario/ui/cadastro/` | Cadastro de usuário |
| `AtualizacaoUsuarioComponent` | `usuario/ui/atualizacao/` | Edição de usuário (dialog) |
| `RelatorioPontosComponent` | `ponto/ui/relatorio-pontos/` | Relatório pessoal de ponto |
| `RelatorioPontosPendentesComponent` | `ponto/ui/relatorio-pontos-pendentes/` | Pendências de aprovação |
| `TabelaPontosComponent` | `ponto/ui/tabela-pontos/` | Tabela de registros de ponto |
| `AtualizacaoComponent` | `registro/ui/atualizacao/` | Edição de registro (dialog) |
| `AprovacaoComponent` | `registro/ui/aprovacao/` | Aprovação de alteração (dialog) |
| `ControleAprovacaoComponent` | `registro/ui/controle-aprovacao/` | Gestão de aprovações (dialog) |
| `TimerComponent` | `registro/ui/timer/` | Input de horário |
| `UnauthorizedComponent` | `error/` | Página de acesso negado (403) |
| `SessionExpiredDialog` | `auth/` | Notificação de sessão expirada |

### Serviços

| Serviço | Descrição |
|---------|-----------|
| `AuthService` | Login, logout, verificação de roles e perfil do usuário |
| `UsuarioService` | CRUD de usuários |
| `PontoService` | Consulta de cartões de ponto e pendências |
| `RegistroService` | CRUD de registros de ponto |
| `PedidoService` | Gestão de pedidos de alteração |
| `RelatorioService` | Download de relatórios (pessoal e setorial) |
| `VersionService` | Leitura da versão da aplicação |

### Modelos de dados

| Modelo | Descrição |
|--------|-----------|
| `Perfil` | Perfil do usuário autenticado (login e permissões) |
| `Usuario` | Entidade usuário (nome, matrícula, crachá, carga horária) |
| `Ponto` | Cartão de ponto (data, registros, indicador de pendência) |
| `Registro` | Entrada individual de ponto (hora, código de acesso) |
| `Pedido` | Pedido de alteração com lista de alterações |
| `Alteracao` | Alteração específica (registro original vs. novo) |

---

## Perfis de Acesso

| Role | Permissões |
|------|-----------|
| `GRP_SIPE_ADMIN` | Acesso total: busca, cadastro, configuração e relatórios |
| `GRP_SIPE_RH` | Busca e cadastro de usuários, relatórios setoriais |
| `GRP_SIPE_DIRETOR` | Busca de usuários, relatórios por lotação |
| `GRP_SIPE_USERS` | Relatório pessoal e solicitação de alterações |

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run watch` | Build em modo watch (re-compila ao salvar) |
| `npm test` | Executa os testes unitários com Karma |
| `npm run prestart` | Gera `version.json` (executado automaticamente antes do `start`) |
| `npm run prebuild` | Gera `version.json` (executado automaticamente antes do `build`) |

---

## Testes

```bash
# Executa os testes unitários
npm test

# Com cobertura de código
ng test --code-coverage
```

Os testes utilizam **Jasmine** como framework e **Karma** como test runner. O relatório de cobertura é gerado na pasta `coverage/`.
