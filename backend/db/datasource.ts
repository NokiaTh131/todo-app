import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

//create database
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: configService.getOrThrow<number>('POSTGRES_PORT'),
  username: configService.getOrThrow<string>('POSTGRES_APP_USER'),
  password: configService.getOrThrow<string>('POSTGRES_APP_PASSWORD'),
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  extra: {
    connectionLimit: 10,
  },
};

const dataSource = new DataSource(dataSourceOptions);

// You might want to do
dataSource.initialize();

export default dataSource;
