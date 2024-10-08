import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createFlattenRelationQuery,
  IRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, Relationship } from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

import { OryKetoEnvironmentVariables } from './environment-variables';

interface CommandOptions
  extends Pick<Configuration, 'basePath' | 'accessToken'> {
  namespace: string;
  object?: string;
  relation?: string;
  subjectNamespace?: string;
  subjectObject?: string;
  subjectRelation?: string;
}

@Command({ name: 'get', description: 'Get relationships on Ory Keto' })
export class GetRelationsCommand extends CommandRunner {
  readonly logger = new Logger(GetRelationsCommand.name);

  constructor(
    private readonly oryRelationshipsService: OryRelationshipsService,
    private readonly configService: ConfigService<
      OryKetoEnvironmentVariables,
      true
    >
  ) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const {
      namespace,
      object,
      relation,
      subjectNamespace,
      subjectObject,
      subjectRelation,
    } = options;
    /**
     * Use the correct base path since the SDK assign the GET /relation-tuples endpoint to the admin API
     */
    options.basePath ??= this.configService.get('ORY_KETO_PUBLIC_URL');
    if (options.basePath || options.accessToken) {
      this.oryRelationshipsService.config = new Configuration({
        ...this.oryRelationshipsService.config,
        ...options,
      });
    }

    const tuple: Partial<IRelationTuple> = {
      namespace,
      object,
      relation,
      ...(!!subjectNamespace && !!subjectObject
        ? {
            subjectIdOrSet: {
              namespace: subjectNamespace,
              object: subjectObject,
              ...(subjectRelation ? { relation: subjectRelation } : {}),
            },
          }
        : {}),
    };
    const result: Relationship[] = [];
    for await (const { relationships } of this.fetchPaginatedRelationships(
      tuple
    )) {
      result.push(...relationships);
    }
    this.logger.debug('Found relationships');
    console.log(JSON.stringify(result, null, 2));
  }

  private async *fetchPaginatedRelationships(
    tuple: Partial<IRelationTuple>,
    options: { pageToken?: string; pageSize?: number } = { pageSize: 50 }
  ): AsyncIterable<{ relationships: Relationship[]; pageToken: string }> {
    const relationQuery = createFlattenRelationQuery(tuple).unwrapOrThrow();
    const { data } = await this.oryRelationshipsService.getRelationships({
      ...relationQuery,
      ...options,
    });
    const pageToken = data.next_page_token ?? '';
    yield { relationships: data.relation_tuples ?? [], pageToken };

    if (pageToken) {
      return this.fetchPaginatedRelationships(
        {
          ...tuple,
        },
        { pageToken, pageSize: options.pageSize }
      );
    }
  }

  @Option({
    flags: '-n, --namespace [string]',
    description: 'namespace of the relationship tuple to get relations from',
    required: true,
  })
  parseNamespace(val: string): string {
    return val;
  }

  @Option({
    flags: '-o, --object [string]',
    description: 'object of the relationship tuple to get relations from',
    required: false,
  })
  parseObject(val: string): string {
    return val;
  }

  @Option({
    flags: '-r, --relation [string]',
    description: 'relation of the relationship tuple to get relations from',
    required: false,
  })
  parseRelation(val: string): string {
    return val;
  }

  @Option({
    flags: '-sn, --subjectNamespace [string]',
    description:
      'namespace of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectNamespace(val: string): string {
    return val;
  }

  @Option({
    flags: '-so, --subjectObject [string]',
    description:
      'object of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectObject(val: string): string {
    return val;
  }

  @Option({
    flags: '-sr, --subjectRelation [string]',
    description:
      'relation of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectRelation(val: string): string {
    return val;
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
