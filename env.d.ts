declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE: string;
      HTTP_PORT: number;
      HTTPS_PORT: number;
      JWT_SECRET: string;
    }
  }
}

export {};
