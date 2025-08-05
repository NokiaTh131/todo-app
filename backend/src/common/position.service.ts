import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PositionService {
  async getNextPosition<T extends { position: number }>(
    repository: Repository<T>,
    whereClause: any,
  ): Promise<number> {
    const lastItem = await repository.findOne({
      where: whereClause,
      order: { position: 'DESC' } as any,
    });
    return lastItem ? lastItem.position + 1 : 1;
  }

  convertDateIfProvided(dateString?: string): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }
}