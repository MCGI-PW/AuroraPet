class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const badRequest = (msg) => new HttpError(400, msg);
const unauthorized = (msg = 'Sessão inválida ou expirada. Faça login novamente.') => new HttpError(401, msg);
const forbidden = (msg = 'Você não tem permissão para esta ação.') => new HttpError(403, msg);
const notFound = (msg = 'Recurso não encontrado.') => new HttpError(404, msg);
const conflict = (msg) => new HttpError(409, msg);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
