/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Namespace, Context } from '@ory/permission-namespace-types';

class User implements Namespace {}

class Toy implements Namespace {
  related: {
    owners: User[];
  };

  permits = {
    play: (ctx: Context) => this.related.owners.includes(ctx.subject),
    break: (ctx: Context) => this.permits.play(ctx),
    steal: (ctx: Context) => !this.permits.play(ctx),
  };
}
