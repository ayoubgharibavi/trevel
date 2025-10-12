import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Don't interfere with successful responses
    if (response.headersSent) {
      return super.catch(exception, host);
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    };

    // Log the full error internally, but send a sanitized version to the client
    this.logger.error(`HTTP Status: ${status} Error Message: ${errorMessage} Path: ${request.url}`, (exception as Error).stack);
    
    // Log the full exception for debugging
    console.error('Full exception:', exception);

    response.status(status).json(errorResponse);
  }
}




















