import { Expose, plainToInstance } from 'class-transformer';
import { IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

export class OryKetoEnvironmentVariables {
  @Expose()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: false,
  })
  ORY_KETO_ADMIN_URL?: string = 'http://localhost:4467';

  @Expose()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: false,
  })
  ORY_KETO_PUBLIC_URL?: string = 'http://localhost:4466';

  @Expose()
  @IsString()
  @IsOptional()
  ORY_KETO_API_KEY?: string = undefined;
}

export function validate(env: Record<string, string>) {
  const validatedConfig = plainToInstance(OryKetoEnvironmentVariables, env, {
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
