import { Controller, Logger, Get, Query, Req } from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/upgrade')
export class UpgradeController {
  private readonly logger = new Logger(UpgradeController.name);

  @Get('/')
  async upgrade(
    @Req() request: Request,
    @Query() query: { dev_mode: boolean },
  ): Promise<any> {
    this.logger.debug('upgrade ' + query.dev_mode);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/upgrade' + '?dev_mode=' + query.dev_mode,
      {},
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/new_version')
  async new_version(
    @Req() request: Request,
    @Query() query: { dev_mode: boolean },
  ): Promise<any> {
    this.logger.debug('new_version ' + query.dev_mode);
    const response: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/upgrade/newversion' +
        '?dev_mode=' +
        query.dev_mode,
    );
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    this.logger.debug(response.data);
    return response.data;
  }

  @Get('/state')
  async state(
    @Req() request: Request,
    @Query() query: { dev_mode: boolean },
  ): Promise<any> {
    this.logger.debug('state ' + query.dev_mode);
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/upgrade/state' + '?dev_mode=' + query.dev_mode,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
