import { Module } from '@nestjs/common';
import { Charter118Controller } from './charter118.controller';
import { Charter118Service } from './charter118.service';

@Module({
  controllers: [Charter118Controller],
  providers: [Charter118Service],
  exports: [Charter118Service],
})
export class Charter118Module {}
