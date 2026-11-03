const { createRemoteJWKSet, decodeJwt, jwtVerify } = require('jose');
const { firebaseProjectId } = require('../config');
const { unauthorized, forbidden } = require('../errors');
const { findUser } = require('../services/users');

/**
 * Valida o Firebase ID Token enviado em "Authorization: Bearer <token>".
 * A assinatura é conferida com as chaves públicas do Google (securetoken),
 * e issuer/audience precisam corresponder ao projeto Firebase do app.
 */
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

/**
 * Desenvolvimento/testes: com FIREBASE_AUTH_EMULATOR_HOST definido, aceita
 * os tokens do Firebase Auth Emulator (que não são assinados), como faz o
 * firebase-admin. Nunca é ativado em produção.
 */
const usingAuthEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
if (usingAuthEmulator) {
  console.warn('[AuroraPet API] Aceitando tokens do Firebase Auth Emulator (somente desenvolvimento).');
}

async function verifyFirebaseToken(token) {
  const payload = usingAuthEmulator
    ? decodeJwt(token)
    : (
        await jwtVerify(token, FIREBASE_JWKS, {
          issuer: `https://securetoken.google.com/${firebaseProjectId}`,
          audience: firebaseProjectId,
        })
      ).payload;
  if (!payload.sub) throw new Error('Token sem usuário.');
  return {
    uid: payload.sub,
    email: payload.email || '',
    name: payload.name || '',
  };
}

/** Exige usuário autenticado e carrega o perfil (req.auth e req.user). */
async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized('Token de autenticação ausente.');
  }
  try {
    req.auth = await verifyFirebaseToken(token);
  } catch {
    throw unauthorized();
  }
  req.user = findUser(req.auth.uid);
  next();
}

/** Exige que o perfil do usuário possua um dos papéis informados. */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw forbidden('Perfil de usuário não encontrado. Conclua o cadastro.');
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

module.exports = { requireAuth, requireRole };
