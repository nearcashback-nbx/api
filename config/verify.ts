import config from "../config";

const verifyConfig = (): void => {
  if (!config.OAUTH_REDIRECT_DOMAIN)
    throw new Error(`'OAUTH_REDIRECT_DOMAIN' must be provided in your .env`);

  if (!config.GOOGLE.CLIENT_ID)
    throw new Error(`'GOOGLE_CLIENT_ID' must be provided in your .env`);
  if (!config.GOOGLE.CLIENT_SECRET)
    throw new Error(`'GOOGLE_CLIENT_SECRET' must be provided in your .env`);
  if (!config.GOOGLE.CALLBACK_URL)
    throw new Error(`'GOOGLE_CALLBACK_URL' must be provided in your .env`);

  if (!config.JWT.SECRET)
    throw new Error(`'JWT_SECRET' must be provided in your .env`);

  if (!config.QUEUE.SECRET)
    throw new Error(`'QUEUE_SECRET' must be provided in your .env`);
  if (!config.QUEUE.DOMAIN)
    throw new Error(`'QUEUE_DOMAIN' must be provided in your .env`);
  if (!config.QUEUE.NAME)
    throw new Error(`'QUEUE_NAME' must be provided in your .env`);

  if (!config.DB.HOST)
    throw new Error(`'DB_HOST' must be provided in your .env`);
  if (!config.DB.PORT)
    throw new Error(`'DB_PORT' must be provided in your .env`);
  if (!config.DB.USER)
    throw new Error(`'DB_USER' must be provided in your .env`);
  if (!config.DB.PASSWORD)
    throw new Error(`'DB_PWD' must be provided in your .env`);
  if (!config.DB.NAME)
    throw new Error(`'DB_NAME' must be provided in your .env`);

  if (!config.GOOGLE_SERVICE_ACCOUNT.EMAIL)
    throw new Error(
      `'GOOGLE_SERVICE_ACCOUNT_EMAIL' must be provided in your .env`
    );
  if (!config.GOOGLE_SERVICE_ACCOUNT.PRIVATE_KEY)
    throw new Error(
      `'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY' must be provided in your .env`
    );
};

export default verifyConfig;
