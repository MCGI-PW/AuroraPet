const fs = require('fs');
const crypto = require('crypto');
const { dataFile, seedFile, serviceAccount } = require('./config');
const { createFileStorage } = require('./storage/fileStorage');
const { createFirestoreStorage } = require('./storage/firestoreStorage');

/**
 * Banco da API mantido em memória e persistido a cada alteração:
 *  - produção (FIREBASE_SERVICE_ACCOUNT definido): Cloud Firestore;
 *  - desenvolvimento/testes: arquivo JSON local.
 * Na primeira execução o banco é criado a partir de data/seed.json.
 * As gravações são enfileiradas para nunca concorrerem entre si.
 */
const storage = serviceAccount ? createFirestoreStorage(serviceAccount) : createFileStorage(dataFile);

let cache = null;
let writeQueue = Promise.resolve();
let pendingWrite = false;

async function init() {
  cache = await storage.load();
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
    await storage.save(cache);
  }
  return storage.name;
}

function data() {
  if (!cache) throw new Error('Banco não inicializado: chame db.init() antes de iniciar o servidor.');
  return cache;
}

/** Agenda a gravação do estado atual (alterações seguidas viram uma só escrita). */
function save() {
  if (pendingWrite) return writeQueue;
  pendingWrite = true;
  writeQueue = writeQueue
    .then(() => {
      pendingWrite = false;
      return storage.save(cache);
    })
    .catch((error) => console.error('[AuroraPet API] Erro ao persistir dados:', error.message));
  return writeQueue;
}

/** Retorna a coleção (array) com o nome informado, criando se necessário. */
function collection(name) {
  const db = data();
  if (!Array.isArray(db[name])) db[name] = [];
  return db[name];
}

/** Lê um documento único (ex.: clinic, subscription). */
function getDoc(name) {
  return data()[name] || null;
}

function setDoc(name, value) {
  data()[name] = value;
  save();
  return value;
}

const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const nowIso = () => new Date().toISOString();

module.exports = { init, collection, getDoc, setDoc, save, newId, nowIso };
