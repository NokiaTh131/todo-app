import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationService } from './authorization.service';
import { PositionService } from './position.service';
import { Board } from '../board/entities/board.entity';
import { List } from '../list/entities/list.entity';
import { Card } from '../card/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, List, Card])],
  providers: [AuthorizationService, PositionService],
  exports: [AuthorizationService, PositionService],
})
export class CommonModule {}