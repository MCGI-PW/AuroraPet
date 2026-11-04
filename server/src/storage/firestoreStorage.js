const { SignJWT, importPKCS8 } = require('jose');

/**
 * Persistência no Cloud Firestore (produção). Hospedagens gratuitas como o
 * Render apagam o disco ao reiniciar; por isso o banco da API é espelhado em
 * um documento do Firestore do mesmo projeto Firebase.
 *
 * Autenticação: conta de serviço do Firebase (variável
 * FIREBASE_SERVICE_ACCOUNT com o JSON) → JWT assinado → access token OAuth.
 */
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/datastore';

function createFirestoreStorage(serviceAccount, { collection = 'aurorapet', documentId = 'database' } = {}) {
  const projectId = serviceAccount.project_id;
  const documentUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${documentId}`;
  let cachedToken = null;

  async function accessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
    const privateKey = await importPKCS8(serviceAccount.private_key, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope: SCOPE })
      .setProtectedHeader({ alg: 'RS256', kid: serviceAccount.private_key_id })
      .setIssuer(serviceAccount.client_email)
      .setAudience(TOKEN_URL)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`Falha ao autenticar no Firestore: ${body.error_description || body.error}`);
    cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
    return cachedToken.value;
  }

  return {
    name: `Firestore (${projectId}/${collection}/${documentId})`,

    async load() {
      const response = await fetch(documentUrl, { headers: { Authorization: `Bearer ${await accessToken()}` } });
      if (response.status === 404) return null;
      const body = await response.json();
      if (!response.ok) throw new Error(`Falha ao ler o Firestore: ${body.error?.message}`);
      return JSON.parse(body.fields.json.stringValue);
    },

    async save(data) {
      const response = await fetch(documentUrl, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            json: { stringValue: JSON.stringify(data) },
            updatedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Falha ao gravar no Firestore: ${body.error?.message || response.status}`);
      }
    },
  };
}

module.exports = { createFirestoreStorage };
