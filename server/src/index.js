const app = require('./app');
const { port, firebaseProjectId, dataFile } = require('./config');

app.listen(port, () => {
  console.log(`[AuroraPet API] http://localhost:${port}/api (Firebase: ${firebaseProjectId}, dados: ${dataFile})`);
});
