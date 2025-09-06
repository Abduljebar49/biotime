import "reflect-metadata"
import { DataSource } from "typeorm"
import { resolve } from 'path';
import { db_host, db_name, db_pass, db_port, db_user } from "./env_setup";


export const AppDataSource = new DataSource({
    type: "postgres",
    url: `postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`,
    synchronize: true,
    logging: false,
    entities: [resolve(__dirname, '../entities', '**', '*.entity.{ts,js}')],
    migrations: [resolve(__dirname, '../migrations', '*.entity.{ts,js}')],
    subscribers: [],
    // ssl: {
    //     rejectUnauthorized: false,
    // },
})
