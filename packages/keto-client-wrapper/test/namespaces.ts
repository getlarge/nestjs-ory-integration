import type {
  Context,
  Namespace,
  SubjectSet,
  // @ts-expect-error - This is a private type from the internal Ory Keto SDK
} from '@ory/permission-namespace-types';

class User implements Namespace {}

class Group implements Namespace {
  related: {
    members: User[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Toy implements Namespace {
  related: {
    owners: User[];
    puppetmasters: SubjectSet<Group, 'members'>[];
  };

  permits = {
    play: (ctx: Context) =>
      this.related.owners.includes(ctx.subject) ||
      this.related.puppetmasters.includes(ctx.subject),
    break: (ctx: Context) => this.permits.play(ctx),
    steal: (ctx: Context) => !this.permits.play(ctx),
  };
}
