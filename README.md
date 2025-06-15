# RestauranteApp

Aplicativo de gerenciamento de reservas para restaurantes desenvolvido em React Native.

## Funcionalidades

- Cadastro de Restaurantes
- Cadastro de número de mesas
- Cadastro de clientes
- Cadastro de reservas
- Envio de e-mail de confirmação de reserva
- Histórico de reservas (visão Restaurante)
- Histórico de reservas (visão Cliente)

## Requisitos

- Node.js
- npm ou yarn
- Expo CLI
- iOS Simulator (para Mac) ou Android Studio (para Android)

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Inicie o projeto:
```bash
npm start
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── screens/        # Telas do aplicativo
  ├── navigation/     # Configuração de navegação
  ├── store/         # Gerenciamento de estado (Redux)
  ├── services/      # Serviços (Firebase, Email, etc)
  ├── types/         # Definições de tipos TypeScript
  └── utils/         # Funções utilitárias
```

## Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- Firebase
- React Navigation
- Redux Toolkit
- React Native Paper 