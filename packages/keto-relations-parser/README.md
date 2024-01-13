# keto-relations-parser

This library can parse a string representation of a Relation tuple to an object structure in typescript.

Relation tuples are used to evaluate permissions in "Zanzibar: Google's Consistent, Global Authorization System".

The BNF of a valid Relation tuple is as follows:

```bnf
<relation-tuple> ::= <object>'#'relation'@'<subject> | <object>'#'relation'@('<subject>')'
<object> ::= namespace':'object_id
<subject> ::= subject_id | <subject_set>
<subject_set> ::= <object>'#'relation
```

## Examples of valid strings

```text
Project:123#owners@User:321
Project:123#editors@Group:admin#members
Group:admin#members@321
```

Which can be verbalized as :

```text
User:123 is owner of Project:123
members of Group:admin are editors of Project:123
321 is member of Group:admin
```

Which can be parsed to the following object structure:

```json
{
  "namespace": "Project",
  "objecy": "123",
  "relation": "owners",
  "subject": {
    "namespace": "User",
    "object": "321"
  }
}
```

```json
{
  "namespace": "Project",
  "id": "123",
  "relation": "editors",
  "subject": {
    "namespace": "Group",
    "object": "admin",
    "relation": "members"
  }
}
```

```json
{
  "namespace": "Group",
  "id": "admin",
  "relation": "members",
  "subject": "321"
}
```

## Install

```sh
npm install @getlarge/keto-relations-parser
```

## Usage

Parse a string to a RelationTuple object:

```ts
import { RelationTupleBuilder } from '@getlarge/keto-relations-parser';

const relationTuple = RelationTupleBuilder.fromString(
  'Project:123#owners@User:321'
);
```

Parse a relation tuple object to a string:

```ts
import { RelationTuple } from '@getlarge/keto-relations-parser';

const relationTuple = new RelationTuple('Project', '123', 'owners', {
  namespace: 'User',
  object: '321',
}).toString();
```

Create a relation tuple using Fluent API:

```ts
import { RelationTupleBuilder } from '@getlarge/keto-relations-parser';

new RelationTupleBuilder()
  .subject('User', '321')
  .isIn('owners')
  .of('Project', '321')
  .toString();
```

## Development

### Building

Run `nx build keto-relations-parser` to build the library.

### Running unit tests

Run `nx test keto-relations-parser` to execute the unit tests via [Jest](https://jestjs.io).
