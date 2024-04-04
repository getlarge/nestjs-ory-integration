import { Expose, plainToInstance } from 'class-transformer';
import { IsUrl, validateSync } from 'class-validator';

export class OryKratosEnvironmentVariables {
  @Expose()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: false,
  })
  ORY_KRATOS_PUBLIC_URL?: string = 'http://localhost:4433';
}

export function validate(env: Record<string, string>) {
  const validatedConfig = plainToInstance(OryKratosEnvironmentVariables, env, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
    whitelist: true,
    validationError: {
      target: false,
    },
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
