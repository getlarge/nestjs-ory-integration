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

@QuestionSet({ name: 'login-questions' })
export class LoginQuestions {
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
  name: 'login',
  arguments: '[password]',
  description: 'Login via Ory Kratos self-service API',
})
export class LoginCommand extends CommandRunner {
  readonly logger = new Logger(LoginCommand.name);

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
          'login-questions',
          undefined
        )
      ).password;
    }

    this.logger.debug('init login flow');
    const {
      data: { id: flowId },
    } = await this.oryFrontendService.createNativeLoginFlow();

    this.logger.debug('complete login flow');
    const {
      data: { session_token: sessionToken },
    } = await this.oryFrontendService.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: {
        method: 'password',
        identifier: email,
        password,
      },
    });
    this.logger.debug('checking session token:', sessionToken);

    const { data } = await this.oryFrontendService.toSession({
      xSessionToken: sessionToken,
    });

    this.logger.log(
      `Logged in with session: ${data.id}, token ${sessionToken}, identity ${data.identity?.id}`
    );
  }

  @Option({
    flags: '-e, --email [string]',
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
