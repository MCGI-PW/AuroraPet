# AuroraPet | Veterinary Management 🐾

> **Entrega da Sprint 3 - Desenvolvimento Front-End & Mobile**  
> Aplicação desenvolvida com **React Native**, **Expo Router**, **TanStack Query**, **Firebase Authentication** e backend HTTP integrado com **Node.js/Express**.


## 👥 Integrantes do Grupo

Maicon      RM561279
Gabriel F.  RM561551
Charlles    RM566482
Iago D.     RM565708, 561279, 561551, 566482
---

## 📋 1. Descrição do Problema e Solução Proposta

### O Problema
No cuidado com animais de estimação, tutores e clínicas veterinárias frequentemente enfrentam desencontros de informações sobre prontuários, histórico de saúde, controle vacinal e agendamento de consultas. A fragmentação desses dados em fichas físicas ou mensagens dispersas compromete a continuidade do tratamento médico preventivo e curativo.

### A Solução Clyvo
A plataforma **Clyvo** oferece um ecossistema digital unificado para conectar tutores e profissionais veterinários:
1. **Landing Page Institucional:** Apresentação elegante e transparente da clínica, serviços especializados, equipe veterinária e canais de contato.
2. **Área Autenticada do Tutor:** Autenticação segura com persistência de sessão via Firebase Auth.
3. **Gestão Completa de Pets (CRUD):** Cadastro, consulta, edição contínua do prontuário (peso, idade, alergias e observações clínicas) e exclusão.
4. **Agendamento Inteligente de Consultas (CRUD):** Marcação de consultas vinculando o pet cadastrado ao médico veterinário especialista, escolha de data/horário e controle de status (Agendada, Realizada, Cancelada).

---

## 🛠️ 2. Tecnologias Utilizadas

- **Front-End / Mobile:** React Native `0.76.7`, Expo `~52.0.37`, Expo Router `~4.0.17`
- **Gerenciamento de Estado & Requisições HTTP:** TanStack Query (`@tanstack/react-query` v5)
- **Autenticação:** Firebase Authentication oficial (`firebase` v11) com persistência automática de sessão
- **Backend HTTP REST:** Node.js + Express com CORS e persistência de dados em disco (`server/data.json`)
- **Linguagem & Tipagem:** TypeScript `^5.3.3` com tipagens estritas em todas as entidades
- **Design & Ícones:** Identidade visual Clyvo (paleta verde floresta `#064e3b`, verde menta `#10b981`, roxo `#7c3aed`), Lucide Icons

---

## 🚀 3. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js versão LTS instalada (v18 ou superior recomendada)
- Gerenciador de pacotes `npm`

### Passo 1: Clonar o Repositório e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd clyvo-vet
npm install
```

### Passo 2: Configurar Variáveis de Ambiente (.env)
Copie o arquivo de exemplo para criar o seu `.env`:
```bash
cp .env.example .env
```
Conteúdo do arquivo `.env`:
```env
# URL base da API HTTP local
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Credenciais do Firebase Authentication (Console do Firebase)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=clyvo-vet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clyvo-vet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=clyvo-vet.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```
> **Nota:** Caso não informe chaves de API do Firebase no momento do teste, a aplicação permite o uso instantâneo do botão **"Entrar como Tutor Demo"** na tela de login, mantendo todas as requisições HTTP REST do backend 100% funcionais!

### Passo 3: Executar a Aplicação (Servidor HTTP + Expo Web/Mobile)
Execute um único comando para inicializar o backend Express e o Expo concorrentemente:
```bash
npm run dev
```
- **Backend API HTTP:** `http://localhost:3001`
- **Front-End Web:** `http://localhost:8081`

Para executar os serviços separadamente:
```bash
# Terminal 1: Servidor HTTP REST
npm run server

# Terminal 2: Aplicação Expo (Web / Mobile)
npm run web
# ou para celular/emulador:
npx expo start
```

---

## 📱 4. Navegação entre Telas (Expo Router) - 11 Rotas Explícitas

A aplicação adota o sistema de rotas por arquivos do **Expo Router**, possuindo **11 telas distintas** sem controle manual por condicionais de renderização:

| # | Rota | Arquivo | Finalidade | Tipo de Rota |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `/` | `app/index.tsx` | Landing Page da Clyvo (Hero, Benefícios, Serviços, Especialistas, Contato) | Pública |
| **2** | `/(auth)/login` | `app/(auth)/login.tsx` | Tela de Login do Tutor com validação e feedback | Pública |
| **3** | `/(auth)/register` | `app/(auth)/register.tsx` | Cadastro de novo tutor com validação de senha | Pública |
| **4** | `/(auth)/forgot-password` | `app/(auth)/forgot-password.tsx` | Recuperação de senha por e-mail | Pública |
| **5** | `/(dashboard)` | `app/(dashboard)/index.tsx` | Visão Geral do tutor: resumo de pets, próximas consultas e atalhos | Protegida (Auth Guard) |
| **6** | `/(dashboard)/pets` | `app/(dashboard)/pets/index.tsx` | Listagem dos pets do tutor com filtro por espécie e exclusão rápida | Protegida (Auth Guard) |
| **7** | `/(dashboard)/pets/new` | `app/(dashboard)/pets/new.tsx` | Formulário completo de cadastro de Pet (HTTP POST) | Protegida (Auth Guard) |
| **8** | `/(dashboard)/pets/[id]` | `app/(dashboard)/pets/[id].tsx` | Prontuário detalhado do Pet com edição completa (HTTP PUT) e exclusão | Protegida (Auth Guard) |
| **9** | `/(dashboard)/appointments` | `app/(dashboard)/appointments/index.tsx` | Listagem de agendamentos com filtros por status (HTTP GET) | Protegida (Auth Guard) |
| **10** | `/(dashboard)/appointments/new` | `app/(dashboard)/appointments/new.tsx` | Formulário para agendar nova consulta (HTTP POST) | Protegida (Auth Guard) |
| **11** | `/(dashboard)/profile` | `app/(dashboard)/profile.tsx` | Informações do tutor logado, sessão e Logout funcional imediato | Protegida (Auth Guard) |

---

## 🌐 5. Integração com API Backend HTTP (35 Pontos)

Todas as requisições de dados da interface são realizadas exclusivamente via protocolo HTTP com o servidor Express (`/server`) através do cliente genérico tipado `apiFetch` e orquestradas pelo **TanStack Query**.

### Endpoints da API REST

#### Entidade 1: Pets (CRUD Completo)
- `GET /api/pets?userId=:uid` - Retorna a lista de pets cadastrados pelo tutor.
- `GET /api/pets/:id` - Retorna os dados completos do prontuário de um pet.
- `POST /api/pets` - Cria um novo pet (Status `201 Created`).
- `PUT /api/pets/:id` - Atualiza prontuário, peso, observações e dados do pet (Status `200 OK`).
- `DELETE /api/pets/:id` - Remove definitivamente o pet do banco de dados (Status `200 OK`).

#### Entidade 2: Agendamentos / Consultas (CRUD Completo)
- `GET /api/appointments?userId=:uid` - Retorna todos os agendamentos do tutor.
- `GET /api/appointments/:id` - Retorna os detalhes de uma consulta específica.
- `POST /api/appointments` - Agenda uma nova consulta veterinária (Status `201 Created`).
- `PUT /api/appointments/:id` - Atualiza o status (ex: Cancelada) ou reagenda a consulta (Status `200 OK`).
- `DELETE /api/appointments/:id` - Exclui o agendamento do banco (Status `200 OK`).

#### Entidades de Suporte
- `GET /api/specialists` - Retorna os médicos veterinários da clínica.
- `GET /api/services` - Retorna os procedimentos veterinários oferecidos.
- `GET /api/health` - Healthcheck do servidor.

### Abstração em Hooks do TanStack Query
- **`usePets(userId)`** e **`usePet(id)`**: Carregamento em segundo plano, controle de cache (`staleTime`) e estado de loading.
- **`useAddPet`**, **`useUpdatePet`**, **`useDeletePet`**: Mutações com invalidação automática de cache (`queryClient.invalidateQueries({ queryKey: ['pets'] })`), refletindo as alterações na UI imediatamente sem recarregar a página.
- **`useAppointments(userId)`**, **`useAddAppointment`**, **`useCancelAppointment`**, **`useDeleteAppointment`**: Mutações integradas com feedback de loading e atualização instantânea.

---

## 🔒 6. Sistema de Autenticação e Proteção de Rotas (20 Pontos)

1. **Serviço Real:** Integração oficial com `firebase/auth` (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `sendPasswordResetEmail`).
2. **Persistência de Sessão:** O estado de autenticação é observado via `onAuthStateChanged`, mantendo o tutor conectado mesmo ao atualizar a página ou reabrir o aplicativo.
3. **Proteção de Rotas (Auth Guard):** Implementada no arquivo `app/(dashboard)/_layout.tsx`. Caso um usuário não autenticado tente acessar qualquer tela sob `/(dashboard)/*`, ele é imediatamente redirecionado para `/(auth)/login`.
4. **Logout Funcional:** Ao clicar em "Sair da Conta" ou "Desconectar", a sessão é encerrada no Firebase e o acesso às telas protegidas é bloqueado instantaneamente, redirecionando para a Landing Page.
5. **Tratamento Amigável de Erros:** Códigos do Firebase Auth (como `auth/invalid-credential`, `auth/email-already-in-use`, etc.) são traduzidos em mensagens claras em português na interface.

---

## 🏗️ 7. Arquitetura e Organização do Código (20 Pontos)

O projeto adota estrita separação de responsabilidades em camadas desacopladas:
```text
clyvo-vet/
├── app/                          # CAMADA DE APRESENTAÇÃO & ROTAS (Expo Router)
│   ├── _layout.tsx               # Provedores globais (QueryClientProvider, AuthProvider)
│   ├── index.tsx                 # Landing Page Clyvo
│   ├── (auth)/                   # Telas de login, cadastro e recuperação de senha
│   └── (dashboard)/              # Telas protegidas de gestão do tutor
│       ├── _layout.tsx           # Layout com Sidebar, Topbar e Auth Guard
│       ├── index.tsx             # Visão Geral
│       ├── pets/                 # Listagem, Criação (/new) e Detalhe/Edição (/[id])
│       ├── appointments/         # Listagem e Novo Agendamento (/new)
│       └── profile.tsx           # Perfil do Tutor
├── server/                       # CAMADA DE BACKEND HTTP (Node.js/Express)
│   ├── data.json                 # Banco de dados persistido em arquivo JSON
│   └── server.js                 # Servidor Express com endpoints REST e validações
├── src/
│   ├── components/               # Componentes visuais reutilizáveis
│   │   ├── common/               # HeaderBrand, inputs e badges
│   │   ├── dashboard/            # Modais e cartões de estatística
│   │   └── landing/              # Seções da Landing Page (Hero, Serviços, Clínica, etc.)
│   ├── contexts/                 # Camada de Estado Global (AuthContext)
│   ├── hooks/                    # Camada de Hooks TanStack Query (usePets, useAppointments)
│   ├── services/                 # Camada de Acesso a Dados / HTTP (api.ts, petService, etc.)
│   ├── styles/                   # Tokens de tema e CSS global
│   └── types/                    # Interfaces TypeScript padronizadas
```

---

## 🎬 8. Roteiro Sugerido para Gravação do Vídeo (Máx: 5 Minutos)

Para atingir a pontuação máxima (15 pontos do vídeo + 20 pontos de documentação) e evitar qualquer penalidade, siga o roteiro abaixo durante a gravação:

| Tempo | Etapa | O que demonstrar e falar |
| :-: | :--- | :--- |
| **0:00 - 0:40** | **Introdução & Landing Page** | Apresente a Clyvo, mostre a Landing Page responsiva com base no design de referência (Hero, Benefícios, Serviços e Especialistas carregados da API). |
| **0:40 - 1:30** | **Sistema de Autenticação** | Demonstre a tela de cadastro e login com validação. Mostre a persistência de sessão (recarregando a página e continuando logado) e a proteção de rotas (tentando acessar `/dashboard` deslogado). |
| **1:30 - 2:45** | **CRUD Completo de Pets (API HTTP)** | Entre em "Meus Pets":<br>1. **Create:** Cadastre um novo pet (ex: "Thor", Cão, Golden Retriever).<br>2. **Read:** Mostre a listagem atualizada instantaneamente via TanStack Query.<br>3. **Update:** Abra o prontuário do pet (`/pets/[id]`), altere o peso e observações e salve (HTTP PUT).<br>4. **Delete:** Exclua um pet com confirmação visual (HTTP DELETE). |
| **2:45 - 4:00** | **CRUD Completo de Consultas (API HTTP)** | Vá para "Consultas & Agendamentos":<br>1. **Create:** Clique em "Nova Consulta", selecione o Pet, Especialista, Data/Hora e confirme (HTTP POST).<br>2. **Read:** Demonstre a listagem com filtros (Agendadas, Realizadas, Canceladas).<br>3. **Update:** Cancele uma consulta agendada (HTTP PUT status 'cancelled').<br>4. **Delete:** Exclua o agendamento da lista (HTTP DELETE). |
| **4:00 - 4:40** | **Arquitetura do Código & DevTools** | Abra brevemente o VS Code e o DevTools Network: mostre a pasta `/server`, os hooks do TanStack Query em `/src/hooks`, e as chamadas HTTP reais na aba Network do navegador. |
| **4:40 - 5:00** | **Logout & Encerramento** | Acesse a tela de Perfil, clique em "Desconectar", comprove o bloqueio imediato do acesso às telas protegidas e finalize o vídeo. |

---

