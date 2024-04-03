import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createFlattenRelationQuery,
  IRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import { Configuration, Relationship } from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

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
    private readonly oryRelationshipsService: OryRelationshipsService
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
    this.logger.log(result);
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
    flags: '-sn, --subject-namespace [string]',
    description:
      'namespace of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectNamespace(val: string): string {
    return val;
  }

  @Option({
    flags: '-so, --subject-object [string]',
    description:
      'object of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectObject(val: string): string {
    return val;
  }

  @Option({
    flags: '-sr, --subject-relation [string]',
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
