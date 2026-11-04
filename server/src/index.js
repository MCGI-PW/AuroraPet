const app = require('./app');
const db = require('./db');
const { port, firebaseProjectId } = require('./config');

db.init()
  .then((storageName) => {
    app.listen(port, () => {
      console.log(`[AuroraPet API] http://localhost:${port}/api (Firebase: ${firebaseProjectId}, dados: ${storageName})`);
    });
  })
  .catch((error) => {
    console.error('[AuroraPet API] Não foi possível carregar o banco de dados:', error.message);
    process.exit(1);
  });
