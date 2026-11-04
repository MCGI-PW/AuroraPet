# Changelog

## Sprint 4 — entrega final
- Autenticação real com Firebase (sem usuários fixos/modo demo) e sessão persistida
- Áreas do tutor e da clínica protegidas por perfil; rotas declaradas
- API com validação do Firebase ID Token, regras de negócio e notificações por evento
- Notificações locais: confirmação, lembretes 24h/1h e eventos da API, com navegação ao tocar
- Tela "Sobre o App" com hash do commit; build do APK no CI e Firebase App Distribution
- Camadas separadas: telas → hooks (TanStack Query) → serviços → API; regras em `src/domain`
- Correções do build Android (dependências nativas, componentes HTML na landing)

## Sprint 3
- CRUD de pets e consultas com TanStack Query e API Express
- Portal da clínica, atendimento clínico e laudo
