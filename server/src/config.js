const path = require('path');

/**
 * Configuração da API lida de variáveis de ambiente.
 * FIREBASE_PROJECT_ID precisa ser o mesmo projeto usado pelo app para
 * que o ID Token emitido pelo Firebase Authentication seja aceito.
 */
module.exports = {
  port: Number(process.env.PORT) || 3001,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'aurorapet-fiap',
  dataFile: process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json'),
  seedFile: path.join(__dirname, '..', 'data', 'seed.json'),
};
