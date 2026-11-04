/**
 * Teste unitário da persistência no Firestore (sem rede): verifica o JWT da
 * conta de serviço, a troca pelo access token e o formato do documento.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { jwtVerify, importSPKI } = require('jose');
const { createFirestoreStorage } = require('../src/storage/firestoreStorage');

test('grava e lê o banco no documento do Firestore usando a conta de serviço', async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const serviceAccount = {
    project_id: 'demo-aurorapet',
    client_email: 'api@demo-aurorapet.iam.gserviceaccount.com',
    private_key_id: 'key-1',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  };
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });

  const calls = [];
  let stored = null;
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url === 'https://oauth2.googleapis.com/token') {
      const assertion = new URLSearchParams(options.body).get('assertion');
      const { payload } = await jwtVerify(assertion, await importSPKI(publicPem, 'RS256'), {
        issuer: serviceAccount.client_email,
        audience: 'https://oauth2.googleapis.com/token',
      });
      assert.equal(payload.scope, 'https://www.googleapis.com/auth/datastore');
      return new Response(JSON.stringify({ access_token: 'token-123', expires_in: 3600 }), { status: 200 });
    }
    assert.equal(options.headers.Authorization, 'Bearer token-123');
    if (options.method === 'PATCH') {
      stored = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    }
    return stored
      ? new Response(JSON.stringify(stored), { status: 200 })
      : new Response(JSON.stringify({ error: { message: 'not found' } }), { status: 404 });
  };

  try {
    const storage = createFirestoreStorage(serviceAccount);
    assert.equal(await storage.load(), null, 'banco ainda não existe');
    await storage.save({ pets: [{ id: 'pet-1', name: 'Thor' }] });
    assert.deepEqual(await storage.load(), { pets: [{ id: 'pet-1', name: 'Thor' }] });

    const documentUrl = 'https://firestore.googleapis.com/v1/projects/demo-aurorapet/databases/(default)/documents/aurorapet/database';
    assert.ok(calls.some((c) => c.url === documentUrl && c.options.method === 'PATCH'));
    assert.equal(calls.filter((c) => c.url.includes('oauth2')).length, 1, 'token reaproveitado enquanto válido');
  } finally {
    global.fetch = originalFetch;
  }
});
