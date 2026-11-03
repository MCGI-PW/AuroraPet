const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { dataFile, seedFile } = require('./config');

/**
 * Persistência em arquivo JSON.
 * Na primeira execução o banco é criado a partir de data/seed.json
 * (catálogo da clínica: especialistas, serviços e planos).
 * A gravação é atômica (arquivo temporário + rename) para evitar corrupção.
 */
let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.copyFileSync(seedFile, dataFile);
  }
  cache = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  return cache;
}

function save() {
  const tmp = `${dataFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf-8');
  fs.renameSync(tmp, dataFile);
}

/** Retorna a coleção (array) com o nome informado, criando se necessário. */
function collection(name) {
  const data = load();
  if (!Array.isArray(data[name])) data[name] = [];
  return data[name];
}

/** Lê um documento único (ex.: clinic, subscription). */
function getDoc(name) {
  return load()[name] || null;
}

function setDoc(name, value) {
  load()[name] = value;
  save();
  return value;
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const nowIso = () => new Date().toISOString();

module.exports = { collection, getDoc, setDoc, save, newId, nowIso };
