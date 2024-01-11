import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OryError, isAxiosError, isOryError } from './ory-error';

@Injectable()
export class OryBaseService implements OnModuleInit {
  readonly logger = new Logger(OryBaseService.name);

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {}

  get axios() {
    return this.httpService.axiosRef;
  }

  async onModuleInit(): Promise<void> {
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if ((isAxiosError(error) || isOryError(error)) && error.config) {
          const { config } = error;
          const shouldRetry =
            typeof config.retryCondition === 'function'
              ? config.retryCondition(error)
              : true;
          if (config?.retries && shouldRetry) {
            const retryDelay =
              typeof config.retryDelay === 'function'
                ? config?.retryDelay(error, config.retries)
                : 250;
            config.retries -= 1;
            this.logger.debug(
              `Retrying request to ${config.url} in ${retryDelay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return this.httpService.axiosRef(config);
          }
          const oryError = new OryError(error);
          return Promise.reject(oryError);
        }
        const oryError = new OryError(error);
        return Promise.reject(oryError);
      }
    );
  }
}
