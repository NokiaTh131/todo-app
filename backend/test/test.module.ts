import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../src/user/user.module';
import { AuthModule } from '../src/auth/auth.module';
import { BoardModule } from '../src/board/board.module';
import { ListModule } from '../src/list/list.module';
import { CardModule } from '../src/card/card.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { testDataSourceOptions } from './test-datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(testDataSourceOptions),
    UserModule,
    AuthModule,
    BoardModule,
    ListModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestModule {}