import { HttpException, InternalServerErrorException } from '@nestjs/common';

export abstract class BaseService {
  protected async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `${errorMessage}: ${error.message}`,
      );
    }
  }

  protected handleEntityNotFound<T>(
    entity: T | null,
    entityName: string,
    id: string,
  ): T {
    if (!entity) {
      throw new InternalServerErrorException(
        `${entityName} with ID ${id} not found`,
      );
    }
    return entity;
  }
}