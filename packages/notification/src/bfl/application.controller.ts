import {
  Controller,
  Logger,
  Get,
  Post,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  @Get('/')
  async get_applications(@Req() request: Request): Promise<any> {
    this.logger.debug('get_applications');
    const data: any = await createInstance(request).get(
      '/bfl/app_process/v1alpha1/myapps',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/:name/setup/policy')
  async get_appFa2(
    @Req() request: Request,
    @Param('name') name: string,
  ): Promise<any> {
    this.logger.debug('get_appFa2');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/policy',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/:name/setup/policy')
  async set_appFa2(
    @Req() request: Request,
    @Param('name') name: string,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('set_appFa2');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/policy',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/:name/setup/domain')
  async setup_domain(
    @Req() request: Request,
    @Param('name') name: string,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('setup_domain');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/domain',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/:name/setup/domain')
  async get_domain(
    @Req() request: Request,
    @Param('name') name: string,
  ): Promise<any> {
    this.logger.debug('get_domain ' + name);
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/domain',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }

    this.logger.debug(data.data);
    if (
      data.data.code == 1 &&
      data.data.message == 'app has not set custom domain'
    ) {
      return { code: 0, data: {}, message: '' };
    }
    return data.data;
  }

  @Post('/:name/setup/auth-level')
  async setup_auth_level(
    @Req() request: Request,
    @Param('name') name: string,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('setup_auth_level');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/auth-level',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }

    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/:name/setup/auth-level')
  async get_auth_level(
    @Req() request: Request,
    @Param('name') name: string,
  ): Promise<any> {
    this.logger.debug('get_auth_level ' + name);
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/auth-level',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);

    if (
      data.data.code == 1 &&
      data.data.message == 'app has not set custom domain'
    ) {
      return { code: 0, data: { authorization_level: 'private' }, message: '' };
    }

    return data.data;
  }
}
