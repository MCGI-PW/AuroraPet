#!/usr/bin/env bash
# Teste de fumaça do APK: instala no emulador, abre o app e verifica se ele
# continua em execução (sem crash nativo ou erro fatal de JavaScript).
set -uo pipefail

APK=$(ls apk/*.apk | head -1)
PKG=br.com.mcgi.aurorapet

adb install -r "$APK"
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
sleep 40

adb exec-out screencap -p > smoke-launch.png
adb logcat -d > smoke-logcat.txt

# anotação com o log do JavaScript (visível no resumo do workflow)
JS_LOG=$(grep "ReactNativeJS" smoke-logcat.txt | tail -15 | sed 's/%/%25/g' | awk '{printf "%s%%0A", $0}')
[ -n "$JS_LOG" ] && echo "::notice title=Log JavaScript do app::${JS_LOG}"

CRASH=$(grep -A25 -E "FATAL EXCEPTION|ReactNativeJS.*(Fatal|Unhandled)" smoke-logcat.txt | head -40 | sed 's/%/%25/g' | awk '{printf "%s%%0A", $0}')
if ! adb shell pidof "$PKG" > /dev/null; then
  echo "::error title=O app fechou após abrir::${CRASH:-sem stack trace no logcat}"
  exit 1
fi
if [ -n "$CRASH" ]; then
  echo "::error title=Erro fatal no logcat::${CRASH}"
  exit 1
fi
echo "::notice title=Smoke test::App instalado, aberto e em execução após 40s."
