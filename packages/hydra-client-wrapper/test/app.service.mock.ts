import { Injectable } from '@nestjs/common';
import { OAuth2Client } from '@ory/client';

@Injectable()
export class ExampleService {
  getExample(client: OAuth2Client) {
    return {
      message: client.client_id
    };
  }
}
