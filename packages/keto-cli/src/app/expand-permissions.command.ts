import { OryPermissionsService } from '@getlarge/keto-client-wrapper';
import {
  createExpandPermissionQuery,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import {
  Configuration,
  PermissionApiExpandPermissionsRequest,
} from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions
  extends Pick<Configuration, 'basePath' | 'accessToken'> {
  tuple: PermissionApiExpandPermissionsRequest;
  depth: number;
}

@Command({ name: 'expand', description: 'Expand permissions on Ory Keto' })
export class ExpandPermissionsCommand extends CommandRunner {
  readonly logger = new Logger(ExpandPermissionsCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { depth, tuple } = options;
    if (options.basePath) {
      this.oryPermissionsService.config = new Configuration({
        ...this.oryPermissionsService.config,
        ...options,
      });
    }
    const tree = await this.oryPermissionsService.expandPermissions({
      ...tuple,
      maxDepth: depth,
    });
    this.logger.log(tree);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description:
      'Relationship tuple to expand from, using Zanzibar notation (without subject)',
    required: true,
  })
  parseRelationTuple(val: string): PermissionApiExpandPermissionsRequest {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subjectIdOrSet, ...tuple } = res.unwrapOrThrow();
    return createExpandPermissionQuery(tuple).unwrapOrThrow();
  }

  @Option({
    flags: '-d, --depth [string]',
    description: 'Max depth of the tree',
    required: false,
  })
  parseDepth(val: string): number {
    return val ? parseInt(val, 10) : 3;
  }
}
