import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { setTimeout } from 'node:timers/promises';

import { isAxiosError, isOryError, OryError } from './ory-error';

@Injectable()
export class OryBaseService implements OnModuleInit {
  readonly logger = new Logger(OryBaseService.name);

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {}

  get axios() {
    return this.httpService.axiosRef;
  }

  onModuleInit(): void {
    // TODO: consider using defekt to wrap response and error
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if ((isAxiosError(error) || isOryError(error)) && error.config) {
          const { config } = error;
          const shouldRetry =
            typeof config.retryCondition === 'function'
              ? config.retryCondition(error)
              : false;
          if (config?.retries && shouldRetry) {
            const retryDelay =
              typeof config.retryDelay === 'function'
                ? config?.retryDelay(error, config.retries)
                : 250;
            config.retries -= 1;
            this.logger.debug(
              `Retrying request to ${config.url} in ${retryDelay}ms`
            );
            await setTimeout(retryDelay);
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
