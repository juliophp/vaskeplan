// Domenefeil som tjenestene kaster. API-laget oversetter dem til HTTP-svar.
export class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
