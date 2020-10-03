declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    REDIS_SESSION_SECRET: string;
    NODEMAILER_USER: string;
    NODEMAILER_PASS: string;
    CORS_ORIGIN: string;
    DOMAIN: string;
    FORGOT_PASSWORD_URL: string;
  }
}
