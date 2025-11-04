
# 🕒 SIPE Web - Sistema Integrado de Ponto Eletrônico

![Angular](https://img.shields.io/badge/Angular-20.0.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Material](https://img.shields.io/badge/Material-20.0.1-purple)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema web para gestão de ponto eletrônico, construído com Angular 20 e Angular Material. Permite o registro, consulta e alteração de pontos, além de gerenciamento completo de usuários.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Build](#-build)
- [Docker](#-docker)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Contribuição](#-contribuição)

---

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login via OAuth2/OIDC
- Controle de acesso baseado em roles (RBAC)
- Guarda de rotas por permissões

### 👥 Gestão de Usuários
- Cadastro de novos usuários
- Consulta com busca e paginação
- Edição de dados cadastrais
- Visualização de pendências por usuário

### ⏰ Gestão de Ponto
- Registro de ponto eletrônico
- Consulta de histórico de pontos
- Solicitação de alteração de ponto
- Aprovação/rejeição de alterações (para gestores)
- Visualização de pendências

### 📊 Dashboard e Relatórios
- Página inicial com visão geral
- Filtros e buscas avançadas
- Exportação de dados

---

## 🛠 Tecnologias

### Core
- **Angular** 20.0.0 - Framework principal
- **TypeScript** 5.8.3 - Linguagem de programação
- **RxJS** 7.8.0 - Programação reativa

### UI/UX
- **Angular Material** 20.0.1 - Componentes de UI
- **Angular CDK** 20.0.1 - Kit de desenvolvimento de componentes
- **Angular Flex Layout** 15.0.0-beta.42 - Layout responsivo

### Autenticação
- **angular-oauth2-oidc** 19.0.0 - Integração OAuth2/OIDC

### Utilitários
- **Moment.js** 2.30.1 - Manipulação de datas
- **UUID** 11.0.2 - Geração de identificadores únicos

### Testes
- **Jasmine** 5.6.0 - Framework de testes
- **Karma** 6.4.0 - Test runner
- **Karma Coverage** 2.2.0 - Cobertura de código

### Build
- **@angular/build** 20.0.0 - Sistema de build do Angular
- **@angular/cli** 20.0.0 - CLI do Angular

---

## 📋 Pré-requisitos

- **Node.js** >= 18.19.0
- **npm** >= 10.x
- **Angular CLI** 20.x (instalado globalmente)
