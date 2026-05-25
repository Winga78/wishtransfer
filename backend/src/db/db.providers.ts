import { env } from 'process';
import { DataSource } from 'typeorm';
require('dotenv').config()

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: env.DB_HOST,
        port: 5432,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
