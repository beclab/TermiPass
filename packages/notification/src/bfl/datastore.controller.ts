import { Controller, Logger, Get, Req, Put, Param, Body } from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/datastore')
export class DataStoreController {
  private readonly logger = new Logger(DataStoreController.name);

  @Get('/:key')
  async get_key(@Req() request: Request, @Param('key') key): Promise<any> {
    this.logger.debug('get_key ' + key);
    const data: any = await createInstance(request).get(
      '/bfl/datastore/v1alpha1/' + key,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Put('/:key')
  async put_key(
    @Req() request: Request,
    @Param('key') key,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('put_key ' + key);
    this.logger.debug(body);
    const data: any = await createInstance(request).put(
      '/bfl/datastore/v1alpha1/' + key,
      body,
      { headers: { 'Content-Type': 'application/json' } },
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
