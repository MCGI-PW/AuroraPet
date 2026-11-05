# AuroraPet 🐾 — prontuário, agenda e comunicação veterinária

> **Entrega final (Sprint 4) — Mobile Application Development (FIAP)**
> App React Native/Expo para tutores, médicos veterinários e a administração da clínica, com API própria, Firebase Authentication e notificações locais ligadas aos eventos do sistema.

| | |
|---|---|
| 🎬 **Vídeo de apresentação** | **https://www.youtube.com/watch?v=gb0NVrvBtdk** |
| 📲 **App publicado** | Firebase App Distribution — versão **1.0.0 (build 1)**, tester: proffelipe.oliveira@fiap.com.br |
| 🔖 **Versão publicada = commit** | tag [`v1.0.0`](https://github.com/MCGI-PW/AuroraPet/releases/tag/v1.0.0) → commit [`e1ad2a1`](https://github.com/MCGI-PW/AuroraPet/commit/e1ad2a1) |
| 🌐 **API** | https://aurorapet-api.onrender.com/api/health |
| 📦 **APK de cada versão** | [Releases do GitHub](https://github.com/MCGI-PW/AuroraPet/releases) (gerado pelo CI a partir do commit) |
| 🔎 **Versão instalada** | Tela **Sobre o App** mostra o *hash do commit* usado no build |

## 👥 Integrantes

| Nome | RM |
|---|---|
| Maicon Douglas | RM561279 |
| Gabriel Fachin | RM561551 |
| Charlles | RM566482 |
| Iago D. Ainette | RM565708 |

---

## 1. Problema e solução

**Problema.** Tutores e clínicas veterinárias perdem informações importantes entre fichas de papel, mensagens e ligações: histórico de saúde, alergias, laudos e horários de consulta ficam espalhados, e o tutor não controla quem acessa os dados do seu pet.

**Solução.** O AuroraPet conecta os três lados do atendimento em um só app:

| Perfil | O que faz no app |
|---|---|
| **Tutor** | Cadastra os pets (prontuário), agenda consultas apenas em horários livres, remarca/cancela, recebe **lembretes** e a **notificação do laudo**, lê/compartilha o laudo e **concede ou revoga** o acesso de cada veterinário ao prontuário (LGPD). |
| **Veterinário** | Vê a própria agenda, atende a consulta (anamnese, sinais vitais, diagnóstico, receita), emite o laudo, consulta prontuários autorizados e envia solicitações à administração. |
| **Clínica (administração)** | Painel da clínica, fila de atendimento, CRUD do corpo clínico (limitado pela cota do plano), planos/assinatura, configurações e resposta às solicitações dos veterinários. |

Fluxo principal (do início ao fim): **cadastro → login → cadastrar pet → agendar consulta (notificação + lembretes) → veterinário atende e emite o laudo → tutor recebe a notificação → toca e abre o laudo.**

## 2. Tecnologias

- **App:** React Native 0.76 + Expo SDK 52, **Expo Router** (rotas por arquivo), TypeScript
- **Dados:** **TanStack Query** (cache, loading, invalidação após mutações)
- **Autenticação:** **Firebase Authentication** (e-mail/senha) com sessão persistida (`getReactNativePersistence` + AsyncStorage)
- **Notificações:** **expo-notifications** (notificações locais agendadas e imediatas, canais Android, ação ao tocar)
- **API:** Node.js + Express 5 em [`server/`](server), validação do Firebase ID Token com `jose`, persistência em JSON
- **Tema:** claro/escuro (segue o sistema e guarda a escolha do usuário)
- **CI/CD:** GitHub Actions — build do APK e envio ao Firebase App Distribution; deploy web no Azure

## 3. Telas e navegação (Expo Router)

Rotas declaradas em [`src/navigation/routes.ts`](src/navigation/routes.ts) e nos `Stack.Screen` de cada layout. As áreas `tutor/` e `clinic/` são protegidas por [`ProtectedArea`](src/components/navigation/ProtectedArea.tsx): sem sessão → `/login`; perfil errado → área do próprio perfil.

| Rota | Tela | Acesso |
|---|---|---|
| `/` | Apresentação da clínica (serviços e especialistas da API); logado → redireciona para a sua área | Pública |
| `/about` | **Sobre o App** — versão, **hash do commit**, data do build, API | Pública |
| `/login` · `/register` · `/forgot-password` | Login, cadastro (tutor/veterinário/clínica) e recuperação de senha | Pública |
| `/tutor` | Visão geral: pets, próxima consulta, atalhos | Tutor |
| `/tutor/pets` · `/tutor/pets/new` · `/tutor/pets/[id]` | Lista, cadastro e prontuário do pet (dados, acessos LGPD, histórico) | Tutor |
| `/tutor/appointments` · `/tutor/appointments/new` · `/tutor/appointments/[id]` | Consultas, agendamento e detalhe (remarcar, cancelar, laudo) | Tutor |
| `/tutor/profile` | Perfil editável, Sobre o App e logout | Tutor |
| `/clinic/vet-portal` | Portal do Veterinário: agenda, pacientes autorizados, solicitações | Veterinário |
| `/clinic` · `/clinic/agenda` · `/clinic/attendance/[id]` | Painel, fila de atendimento e atendimento clínico (laudo) | Clínica e veterinário |
| `/clinic/vets` · `/clinic/vets/new` · `/clinic/vets/[id]` | Corpo clínico: lista, cadastro, edição/remoção | Clínica |
| `/clinic/requests` · `/clinic/subscription` · `/clinic/settings` | Solicitações, planos/cotas e dados da clínica | Clínica |

## 4. Notificações (locais, ligadas a eventos reais)

Implementação: [`localNotificationService`](src/services/localNotificationService.ts), [`useNotifications`](src/hooks/useNotifications.ts) e [`useNotificationNavigation`](src/hooks/useNotificationNavigation.ts).

| Evento gerador | Notificação no aparelho | Ao tocar |
|---|---|---|
| Tutor **agenda uma consulta** | "Consulta agendada ✅" na hora + **lembretes 24h e 1h antes** do horário | Abre o detalhe da consulta |
| Tutor **remarca/cancela/exclui** | Lembretes reagendados/cancelados automaticamente | — |
| Veterinário **emite o laudo** (API) | Tutor recebe "Laudo de *Pet* disponível" | Abre a consulta com o botão do laudo |
| Tutor **concede/revoga acesso** (API) | Veterinário recebe "Novo acesso a prontuário" / "Acesso revogado" | Abre o Portal do Vet |
| Consulta agendada ou cancelada pela outra parte (API) | Veterinário/clínica ou tutor são avisados | Abre o atendimento / a consulta |
| Solicitação enviada / respondida (API) | Administração / veterinário são avisados | Abre Solicitações / Portal do Vet |

Os eventos da API são gravados em `/api/notifications`; o app sincroniza a caixa a cada 15 s e exibe como notificação local **somente as novas** (não repete as já exibidas). O sino do cabeçalho mostra a caixa de entrada. Os lembretes são cancelados no logout.

**Como demonstrar:** em um aparelho entre como tutor e agende → notificação imediata. Em outro aparelho (ou no web) entre como veterinário e emita o laudo → o celular do tutor recebe a notificação em até 15 s; tocar nela abre o laudo.

## 5. Autenticação e segurança

- **Firebase Authentication** (e-mail/senha): login, cadastro, recuperação de senha e logout — sem usuários fixos ou modo demo.
- Sessão persistida no aparelho (AsyncStorage); ao reabrir o app o usuário cai direto na sua área.
- Formulários validados (e-mail, senha mínima, confirmação, CRMV) com mensagens de erro do Firebase traduzidas e indicadores de carregamento.
- A API exige `Authorization: Bearer <Firebase ID Token>` em todas as rotas privadas; o usuário é identificado pelo token e cada rota valida o perfil (tutor, veterinário, clínica). O veterinário só lê prontuários autorizados pelo tutor ou de consultas suas.

## 6. Arquitetura e organização

```text
app/                       Telas e rotas (Expo Router) — apenas UI
├── _layout.tsx            Providers, Stack raiz e bootstrap de notificações
├── index.tsx, about.tsx   Apresentação e Sobre o App
├── (auth)/                login, register, forgot-password
├── tutor/                 área do tutor (layout protegido + telas)
└── clinic/                área da clínica/veterinário (layout protegido + telas)
src/
├── components/            Componentes reutilizáveis por domínio (pets, appointments, clinic, forms, common...)
├── hooks/                 Hooks do TanStack Query e de sessão (usePets, useAppointments, useAuth, useNotifications...)
├── services/              Acesso a dados: cliente HTTP, serviços por recurso, Firebase, notificações locais
├── domain/                Regras de negócio puras (agenda livre, lembretes, prazos, validações, laudo em texto)
├── navigation/            Rotas e controle de acesso por perfil
├── contexts/              Sessão do Firebase e tema
├── config/                Configuração (Firebase, URL da API, versão/commit)
├── types/                 Tipos das entidades
└── utils/                 Validação de formulários e diálogos
server/                    API REST (Express): rotas, middleware de auth, serviços, persistência e testes
```

Camadas: **tela → hook (TanStack Query) → service (HTTP) → API**. As telas não fazem chamadas HTTP nem contêm regras de negócio.

## 7. API REST (`server/`)

| Recurso | Endpoints |
|---|---|
| Perfil | `GET/PUT /api/users/me` |
| Pets (CRUD) | `GET /api/pets` · `GET/PUT/DELETE /api/pets/:id` · `POST /api/pets` |
| Consultas (CRUD) | `GET/POST /api/appointments` · `GET/PUT/DELETE /api/appointments/:id` · `GET/POST /api/appointments/:id/report` |
| Corpo clínico (CRUD) | `GET/POST /api/specialists` · `GET/PUT/DELETE /api/specialists/:id` · `GET /api/specialists/:id/busy-slots` |
| Clínica e planos | `GET/PUT /api/clinic` · `GET /api/services` · `GET /api/plans` · `GET/PUT /api/clinic/subscription` |
| Autorizações (LGPD) | `GET/POST /api/authorizations` · `PUT /api/authorizations/:id/revoke` |
| Solicitações | `GET/POST /api/requests` · `PUT /api/requests/:id` |
| Notificações | `GET /api/notifications` · `PUT /api/notifications/:id/read` · `PUT /api/notifications/read-all` |

Erros sempre como `{ "error": "mensagem" }` com o status HTTP correto (400, 401, 403, 404, 409).

## 8. Publicação (Firebase App Distribution)

1. Ao criar a tag `vX.Y.Z`, o workflow [`android-release.yml`](.github/workflows/android-release.yml) compila o APK **a partir daquele commit** (`expo prebuild` + Gradle), anexa à Release do GitHub e envia ao **Firebase App Distribution** para os testers.
2. O hash do commit (`GITHUB_SHA`) é gravado no app e exibido em **Sobre o App** → o APK instalado pode ser conferido com o commit do repositório.

## 9. Qualidade e testes

| Verificação | Onde |
|---|---|
| TypeScript sem erros (`tsc --noEmit`) | local e no CI a cada build do APK |
| Teste de integração da API: os 3 perfis, permissões (401/403), CRUDs, agenda, LGPD, laudo e notificações | [`server/test/api.e2e.test.js`](server/test/api.e2e.test.js) |
| Teste unitário da persistência no Firestore | [`server/test/firestoreStorage.test.js`](server/test/firestoreStorage.test.js) |
| **APK aberto em emulador Android 14** no CI (falha se o app fechar ou houver erro fatal) | job `smoke-test` em [`android-release.yml`](.github/workflows/android-release.yml) |

## 10. Hospedagem da API

A API roda no **Render** ([`render.yaml`](render.yaml), pasta `server/`). Como o plano gratuito apaga o disco ao reiniciar, os dados são persistidos no **Cloud Firestore** do mesmo projeto Firebase (variável `FIREBASE_SERVICE_ACCOUNT`, configurada só no painel do Render). As regras do Firestore ([`firestore.rules`](firestore.rules)) negam qualquer acesso direto do app: todos os dados passam pela API, que valida o token e o perfil.

## 11. Como executar

**Pré-requisitos:** Node.js 20+, npm. Para o celular: app Expo Go ou emulador Android.

```bash
git clone https://github.com/MCGI-PW/AuroraPet.git
cd AuroraPet
npm install
npm run server:install
```

A configuração pública do Firebase e a URL da API de produção já estão em [`app.config.js`](app.config.js) — o app funciona sem nenhum `.env`.

```bash
npm start          # Expo (QR code para o celular / tecla a para Android / w para web)
```

**Rodando a API localmente** (opcional):

```bash
npm run server                                        # http://localhost:3001/api
EXPO_PUBLIC_API_URL=http://localhost:3001/api npm start
```

**Testes:**

```bash
npm run typecheck                                              # TypeScript sem erros
firebase emulators:start --only auth --project demo-aurorapet  # outro terminal
npm --prefix server test                                       # fluxo completo da API (3 perfis)
```

## 12. Roteiro do vídeo

1. **Sobre o App** — mostrar a versão e o hash do commit (igual ao do GitHub) e o app instalado pelo App Distribution.
2. **Cadastro e login** — validações, erro de senha, criação de conta de tutor; fechar e reabrir o app (sessão mantida).
3. **Tutor** — cadastrar pet, editar prontuário, conceder acesso a um veterinário.
4. **Agendamento** — escolher veterinário e horário livre → **notificação "Consulta agendada"**; remarcar e cancelar.
5. **Veterinário** (outro aparelho/web) — Portal do Vet, paciente autorizado, atender e **emitir laudo**.
6. **Notificação do laudo** — chega no celular do tutor; tocar abre a consulta e o laudo (compartilhar).
7. **Clínica** — painel, corpo clínico (cadastrar/editar/remover), solicitações, planos.
8. **Tema claro/escuro, proteção de rotas e logout.**
