declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    AES_KEY: string;
    JWT_SECRET?: string;
    API_PORT?: string;
    CORS_ORIGIN?: string;
    BRIGHT_DATA_WSS?: string;
    BRIGHT_DATA_ZONE?: string;
    APP_SECRET?: string;
  }
}
