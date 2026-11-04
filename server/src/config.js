const path = require('path');

/** Conta de serviço do Firebase (JSON em variável de ambiente), usada para persistir no Firestore. */
function parseServiceAccount(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT não contém um JSON válido.');
  }
}

/**
 * Configuração da API lida de variáveis de ambiente.
 * FIREBASE_PROJECT_ID precisa ser o mesmo projeto usado pelo app para
 * que o ID Token emitido pelo Firebase Authentication seja aceito.
 */
module.exports = {
  port: Number(process.env.PORT) || 3001,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'aurorapet-fiap',
  serviceAccount: parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT),
  dataFile: process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json'),
  seedFile: path.join(__dirname, '..', 'data', 'seed.json'),
};
