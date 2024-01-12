import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  getExample() {
    return {
      message: 'OK',
    };
  }
}
