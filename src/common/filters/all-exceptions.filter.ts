import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || JSON.stringify(resObj);
        error = resObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      // In development/test environments we can optionally attach raw messages,
      // but in production we keep it generic to avoid leaking server internals.
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
    };

    // Log internal server errors (500) as error logs with stack traces,
    // and client-side validation/not found errors (400, 404, etc.) as warnings.
    if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : '';
      this.logger.error(
        `Method: ${httpAdapter.getRequestMethod(request)} | Url: ${responseBody.path} | Error: ${exception instanceof Error ? exception.message : exception}`,
        stack,
      );
    } else {
      this.logger.warn(
        `Method: ${httpAdapter.getRequestMethod(request)} | Url: ${responseBody.path} | Status: ${httpStatus} | Msg: ${JSON.stringify(message)}`,
      );
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
