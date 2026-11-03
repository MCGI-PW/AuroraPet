const { execSync } = require('child_process');

/**
 * Configuração do Expo (substitui o app.json).
 *
 * - commitHash: hash do commit usado no build. No CI vem de GITHUB_SHA; em
 *   builds locais é lido do git. É exibido na tela "Sobre o App" para provar
 *   que a versão publicada corresponde ao código do repositório.
 * - apiUrl / firebase: valores públicos do ambiente de produção. Podem ser
 *   sobrescritos por variáveis EXPO_PUBLIC_* (veja .env.example).
 */
function resolveCommitHash() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'desconhecido';
  }
}

const PRODUCTION = {
  apiUrl: 'https://aurorapet-api.azurewebsites.net/api',
  firebase: {
    apiKey: '',
    authDomain: 'aurorapet-fiap.firebaseapp.com',
    projectId: 'aurorapet-fiap',
    storageBucket: 'aurorapet-fiap.firebasestorage.app',
    messagingSenderId: '',
    appId: '',
  },
};

const env = process.env;

module.exports = {
  expo: {
    name: 'AuroraPet',
    slug: 'aurorapet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'aurorapet',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ecfdf5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'br.com.mcgi.aurorapet',
    },
    android: {
      package: 'br.com.mcgi.aurorapet',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: ['POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED', 'SCHEDULE_EXACT_ALARM'],
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-asset',
      ['expo-notifications', { color: '#10b981' }],
    ],
    extra: {
      commitHash: resolveCommitHash(),
      buildDate: new Date().toISOString(),
      repositoryUrl: 'https://github.com/MCGI-PW/AuroraPet',
      apiUrl: env.EXPO_PUBLIC_API_URL || PRODUCTION.apiUrl,
      firebase: {
        apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY || PRODUCTION.firebase.apiKey,
        authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || PRODUCTION.firebase.authDomain,
        projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || PRODUCTION.firebase.projectId,
        storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || PRODUCTION.firebase.storageBucket,
        messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || PRODUCTION.firebase.messagingSenderId,
        appId: env.EXPO_PUBLIC_FIREBASE_APP_ID || PRODUCTION.firebase.appId,
      },
    },
  },
};
