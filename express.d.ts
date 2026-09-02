// the tenant is attached by verifyJWT, decoded from the signed token.
// controllers read it instead of a client-supplied header.
declare global {
  namespace Express {
    interface Request {
      tenant?: string;
    }
  }
}

export {};
