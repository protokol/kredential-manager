import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from './ebsi-error';

@Catch(HttpException)
export class EbsiExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as ErrorResponse;



        response
            .status(status)
            .json({
                error: exceptionResponse.error || 'invalid_request',
                error_description: exceptionResponse.error_description || exception.message,
                ...(exceptionResponse.state && { state: exceptionResponse.state })
            });
    }
}