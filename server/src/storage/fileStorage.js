const fs = require('fs');
const path = require('path');

/** Persistência local em arquivo JSON (desenvolvimento e testes). */
function createFileStorage(dataFile) {
  return {
    name: `arquivo ${dataFile}`,

    async load() {
      if (!fs.existsSync(dataFile)) return null;
      return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    },

    async save(data) {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      const tmp = `${dataFile}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, dataFile);
    },
  };
}

module.exports = { createFileStorage };
