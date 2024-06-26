import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import { Configuration, type RelationQuery } from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions
  extends Pick<Configuration, 'basePath' | 'accessToken'> {
  tuple: RelationQuery;
}

@Command({ name: 'create', description: 'Create relationship on Ory Keto' })
export class CreateRelationCommand extends CommandRunner {
  readonly logger = new Logger(CreateRelationCommand.name);

  constructor(
    private readonly oryRelationshipsService: OryRelationshipsService
  ) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { tuple } = options;
    if (options.accessToken || options.basePath) {
      this.oryRelationshipsService.config = new Configuration({
        ...this.oryRelationshipsService.config,
        ...options,
      });
    }
    await this.oryRelationshipsService.createRelationship({
      createRelationshipBody: tuple,
    });
    this.logger.debug('Created relation');
    console.log(JSON.stringify(tuple, null, 2));
  }

  @Option({
    flags: '-t, --tuple [string]',
    description: 'Relationship tuple to create, using Zanzibar notation',
    required: true,
  })
  parseRelationTuple(val: string): RelationQuery {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    return createRelationQuery(res.value).unwrapOrThrow();
  }

  @Option({
    flags: '-b, --basePath [string]',
    description: 'Ory Keto Admin API URL',
    required: false,
  })
  parseBasePath(val: string): string | undefined {
    return val;
  }

  @Option({
    flags: '-a, --accessToken [string]',
    description: 'Ory Keto Access Token',
    required: false,
  })
  parseAccessToken(val: string): string | undefined {
    return val;
  }
}
