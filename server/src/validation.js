/** Utilitários de validação e normalização dos dados de entrada. */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
const isTime = (value) => /^\d{2}:\d{2}$/.test(value || '');

/** Formata YYYY-MM-DD como DD/MM para mensagens. */
const formatDayMonth = (isoDate) => {
  const [, m, d] = (isoDate || '').split('-');
  return d && m ? `${d}/${m}` : isoDate;
};

module.exports = { text, isIsoDate, isTime, formatDayMonth };
