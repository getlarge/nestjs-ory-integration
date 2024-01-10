import type { AxiosError } from 'axios';

export function isAxiosError(error: unknown): error is AxiosError {
  return (
    (typeof error === 'object' &&
      !!error &&
      (error as AxiosError).isAxiosError) ??
    false
  );
}

export class OryError extends Error {
  constructor(
    readonly error: unknown,
    readonly defaultStatus = 500,
    readonly defaultReason = 'Error connecting to the Ory Keto API'
  ) {
    super(OryError.parseError(error));
    Object.setPrototypeOf(this, OryError.prototype);
  }

  static parseError(error: unknown): string {
    if (isAxiosError(error)) {
      return error.cause?.message ?? error.message;
    }
    if (isOryError(error)) {
      return error.errorMessage;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }

  get errorMessage(): string {
    return OryError.parseError(this.error) ?? this.defaultReason;
  }

  get statusCode(): number {
    if (isAxiosError(this.error)) {
      return this.error.response?.status ?? this.defaultStatus;
    }
    if (isOryError(this.error)) {
      return this.error.statusCode;
    }
    return this.defaultStatus;
  }

  getDetails(): Record<string, unknown> {
    if (isAxiosError(this.error)) {
      return (this.error.response?.data ?? {}) as Record<string, unknown>;
    }
    if (isOryError(this.error)) {
      return this.error.getDetails();
    }
    return {};
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.errorMessage }];
  }
}

export function isOryError(error: unknown): error is OryError {
  return error instanceof OryError;
}
