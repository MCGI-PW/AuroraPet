#!/usr/bin/env bash
# Provisiona o projeto Firebase do AuroraPet (executar uma vez, após `firebase login`).
#   bash scripts/setup-firebase.sh <id-do-projeto>
# Cria o projeto, os apps Web e Android, ativa o login por e-mail/senha,
# cria o Firestore (persistência da API) e publica as regras.
set -euo pipefail

PROJECT_ID="${1:?informe o ID do projeto (ex.: aurorapet-fiap)}"
ANDROID_PACKAGE="br.com.mcgi.aurorapet"

echo "== Projeto"
firebase projects:list | grep -q "$PROJECT_ID" || firebase projects:create "$PROJECT_ID" --display-name "AuroraPet"
firebase use "$PROJECT_ID" --add > /dev/null 2>&1 || true

echo "== App Web (configuração usada pelo app.config.js)"
WEB_APP_ID=$(firebase apps:list WEB --project "$PROJECT_ID" | grep -o '1:[0-9]*:web:[a-z0-9]*' | head -1 || true)
if [ -z "$WEB_APP_ID" ]; then
  firebase apps:create WEB "AuroraPet" --project "$PROJECT_ID"
  WEB_APP_ID=$(firebase apps:list WEB --project "$PROJECT_ID" | grep -o '1:[0-9]*:web:[a-z0-9]*' | head -1)
fi
firebase apps:sdkconfig WEB "$WEB_APP_ID" --project "$PROJECT_ID"

echo "== App Android (Firebase App Distribution)"
ANDROID_APP_ID=$(firebase apps:list ANDROID --project "$PROJECT_ID" | grep -o '1:[0-9]*:android:[a-z0-9]*' | head -1 || true)
if [ -z "$ANDROID_APP_ID" ]; then
  firebase apps:create ANDROID "AuroraPet" --package-name "$ANDROID_PACKAGE" --project "$PROJECT_ID"
  ANDROID_APP_ID=$(firebase apps:list ANDROID --project "$PROJECT_ID" | grep -o '1:[0-9]*:android:[a-z0-9]*' | head -1)
fi
echo "ANDROID_APP_ID=$ANDROID_APP_ID"

echo "== Firestore (persistência da API) e regras"
firebase firestore:databases:list --project "$PROJECT_ID" | grep -q "(default)" \
  || firebase firestore:databases:create "(default)" --location southamerica-east1 --project "$PROJECT_ID"

echo "== Login por e-mail/senha + regras do Firestore"
firebase deploy --only auth,firestore:rules --project "$PROJECT_ID"

echo "Pronto. Copie a configuração Web acima para app.config.js (PRODUCTION.firebase)."
