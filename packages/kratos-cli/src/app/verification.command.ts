import { OryFrontendService } from '@getlarge/kratos-client-wrapper';
import { Logger } from '@nestjs/common';
import { Configuration } from '@ory/client';
import { isEmail } from 'class-validator';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions extends Pick<Configuration, 'basePath'> {
  email: string;
  method: 'code' | 'link';
}

@Command({
  name: 'verify',
  description: 'Verify email address via Ory Kratos self-service API',
})
export class VerificationCommand extends CommandRunner {
  readonly logger = new Logger(VerificationCommand.name);

  constructor(private readonly oryFrontendService: OryFrontendService) {
    super();
  }

  async run(inputs: string[], options: CommandOptions): Promise<void> {
    const { email, method } = options;
    if (options.basePath) {
      this.oryFrontendService.config = new Configuration({
        ...this.oryFrontendService.config,
        ...options,
      });
    }

    this.logger.debug('init verification flow');
    const {
      data: { id: flowId },
    } = await this.oryFrontendService.createNativeVerificationFlow();

    this.logger.debug('complete verification flow');
    await this.oryFrontendService.updateVerificationFlow({
      flow: flowId,
      updateVerificationFlowBody: {
        email,
        method,
      },
    });
    this.logger.debug(`verification flow ${flowId} completed`);
  }

  @Option({
    flags: '-e, --email <string>',
    description: 'Email address to login with',
    required: true,
  })
  parseEmail(val: string): string {
    if (isEmail(val)) {
      return val;
    }
    throw new TypeError('Invalid email address');
  }

  @Option({
    flags: '-m, --method [string]',
    description: 'Verification method',
    required: false,
  })
  parseVerificationMethod(val: string): string {
    if (!val) {
      return 'code';
    }
    if (['code', 'link'].includes(val)) {
      return val;
    }
    throw new TypeError('Invalid verification method');
  }

  @Option({
    flags: '-b, --basePath [string]',
    description: 'Ory Kratos Public API URL',
    required: false,
  })
  parseBasePath(val: string): string {
    return val;
  }
}
