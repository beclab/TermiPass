import { Controller, Logger, Get, Req } from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/backend')
export class BackendController {
  private readonly logger = new Logger(BackendController.name);

  @Get('/v1/user-info')
  async get_user_info(@Req() request: Request): Promise<any> {
    this.logger.debug('backend get_user_info');
    const data: any = await createInstance(request).get(
      '/bfl/backend/v1/user-info',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/v1/ip')
  async ip(@Req() request: Request): Promise<any> {
    this.logger.debug('backend get ip');
    const data: any = await createInstance(request).get('/bfl/backend/v1/ip');
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
