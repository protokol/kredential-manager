import { HttpException, HttpStatus } from '@nestjs/common';
import { EbsiError } from './ebsi-error';

export function handleError(error: unknown): never {
    // If it's already an EbsiError, convert it to HttpException
    if (error instanceof EbsiError) {
        throw new HttpException(
            {
                error: error.error,
                error_description: error.error_description
            },
            400
        );
    }

    // If it's already an HttpException, just throw it
    if (error instanceof HttpException) {
        throw error;
    }

    // Handle unknown errors
    throw new HttpException(
        {
            error: 'invalid_request',
            error_description: error instanceof Error ? error.message : 'An unexpected error occurred'
        },
        400
    );
}