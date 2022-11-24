import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "./config";

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DB.HOST,
  port: config.DB.PORT,
  username: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.NAME,
  synchronize: false,
  logging: true,
  migrationsRun: false,
  migrations: ["dist/**/migrations/*.js"],
  entities: ["dist/models/**/entity.js"],
});

try {
  AppDataSource.initialize();
} catch (err: any) {
  console.error(`Couldn't initialize Database connection`);
}

export default AppDataSource;
