import { OryFrontendService } from '@getlarge/kratos-client-wrapper';
import { Logger } from '@nestjs/common';
import { Configuration } from '@ory/client';
import { isEmail } from 'class-validator';
import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
  Question,
  QuestionSet,
} from 'nest-commander';

interface CommandOptions extends Pick<Configuration, 'basePath'> {
  email: string;
  password?: string;
}

@QuestionSet({ name: 'registration-questions' })
export class RegistrationQuestions {
  @Question({
    message: 'Password:',
    name: 'password',
    type: 'password',
  })
  parsePassword(val: string) {
    if (!val) {
      throw new Error('Password is required');
    }
    return val;
  }
}

// TODO: find a solution to allow dynamic question sets based on Ory kratos identity schema

@Command({
  name: 'register',
  arguments: '[password]',
  description: 'Register via Ory Kratos self-service API',
})
export class RegistrationCommand extends CommandRunner {
  readonly logger = new Logger(RegistrationCommand.name);

  constructor(
    private readonly inquirer: InquirerService,
    private readonly oryFrontendService: OryFrontendService
  ) {
    super();
  }

  async run(inputs: string[], options: CommandOptions): Promise<void> {
    const { email } = options;
    let { password } = options;
    if (options.basePath) {
      this.oryFrontendService.config = new Configuration({
        ...this.oryFrontendService.config,
        ...options,
      });
    }

    if (!password) {
      password = (
        await this.inquirer.ask<{ password: string }>(
          'registration-questions',
          undefined
        )
      ).password;
    }

    this.logger.debug('init registration flow');
    const {
      data: { id: flowId },
    } = await this.oryFrontendService.createNativeRegistrationFlow();

    this.logger.debug('complete registration flow');
    const { data } = await this.oryFrontendService.updateRegistrationFlow({
      flow: flowId,
      updateRegistrationFlowBody: {
        traits: { email },
        password,
        method: 'password',
      },
    });

    this.logger.debug(
      `Registered with email: ${email} and identity.id: ${data.identity.id}`
    );
    console.log(
      JSON.stringify({
        email,
        identityId: data.identity.id,
      })
    );
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
    throw new Error('Invalid email address');
  }

  @Option({
    flags: '-p, --password [string]',
    description: 'Password to login with',
    required: false,
  })
  parsePassword(val: string): string {
    return val;
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
