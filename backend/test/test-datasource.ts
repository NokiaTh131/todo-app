import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../src/user/entities/user.entity';
import { Board } from '../src/board/entities/board.entity';
import { List } from '../src/list/entities/list.entity';
import { Card } from '../src/card/entities/card.entity';

config();

export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_APP_USER || 'sudoman',
  password: process.env.POSTGRES_APP_PASSWORD || '5678',
  database: process.env.POSTGRES_DB || 'tododb',
  entities: [User, Board, List, Card],
  synchronize: true,
  dropSchema: true, // This will clean the database before each test run
  logging: false,
};