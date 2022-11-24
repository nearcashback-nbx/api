import dotenv from "dotenv";
dotenv.config();

export * from "./prices";

export default {
  PORT: parseInt(process.env.PORT || "") || 8080,
  API_KEY: process.env.API_KEY || "",
  CLAIM_DOMAIN: process.env.CLAIM_DOMAIN || "",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  CONTRACT_ID: process.env.CONTRACT_ID || "",
  NETWORK: process.env.NETWORK || "development",
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
  },
  OAUTH_REDIRECT_DOMAIN: process.env.OAUTH_REDIRECT_DOMAIN as string,
  JWT: {
    SECRET: process.env.JWT_SECRET as string,
    EXPIRATION: 60 * 60 * 24 * 7, // week in seconds
  },
  DB: {
    HOST: process.env.DB_HOST as string,
    PORT: parseInt(process.env.DB_PORT || "") || 5432,
    USER: process.env.DB_USER as string,
    PASSWORD: process.env.DB_PWD as string,
    NAME: process.env.DB_NAME as string,
  },
  QUEUE: {
    SECRET: process.env.QUEUE_SECRET as string,
    DOMAIN: process.env.QUEUE_DOMAIN as string,
    NAME: process.env.QUEUE_NAME as string,
  },
  GOOGLE_SERVICE_ACCOUNT: {
    EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
    PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ) as string,
  },
};
