const express = require('express');
const cors = require('cors');
const { HttpError } = require('./errors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'online', service: 'AuroraPet API', timestamp: new Date().toISOString() });
});

app.use('/api', require('./routes/clinic'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/authorizations', require('./routes/authorizations'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Erros no formato { error: "mensagem" } com o status HTTP correto
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
  }
  console.error('[AuroraPet API] Erro inesperado:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;
