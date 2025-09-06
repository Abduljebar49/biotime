import dotenv from 'dotenv';

dotenv.config();


export const db_name = process.env.DB_NAME;
export const db_user = process.env.DB_USERNAME;
export const db_pass = String(process.env.DB_PASSWORD);
export const db_host = String(process.env.DB_HOST);
export const db_port = Number(process.env.DB_PORT);

export const jwt_secret = process.env.JWT_SECRET;

