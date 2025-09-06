
import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';
export class MissingFieldsError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "MissingFieldsError";
        this.statusCode = 400;
    }
}

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "MissingFieldsError";
        this.statusCode = statusCode;
    }
}

export class DuplicateEmailOrPhoneError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "DuplicateEmailOrPhoneError";
        this.statusCode = 409;
    }
}

export class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
    }
}

export class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 404;
    }
}

// src/errors/index.ts
export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract serializeErrors(): { message: string; field?: string }[];
}

export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string, public errors?: any) {
        super(message);
    }
    serializeErrors() {
        return [{ message: this.message, ...(this.errors && { details: this.errors }) }];
    }
}

export const handleZodError = (reply: FastifyReply, error: ZodError) => {
  const firstError = error.errors[0];
  const field = firstError?.path?.join('.') || 'field';
  const message = firstError?.message || 'Invalid input';
  const formattedError = `${field}: ${message}`;

  return reply.status(400).send({
    status: 'error',
    message: formattedError,
    success: false,
    error: formattedError,
  });
};



export class ForbiddenError extends CustomError {
    statusCode = 403;
    constructor(public message: string) {
        super(message);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}

