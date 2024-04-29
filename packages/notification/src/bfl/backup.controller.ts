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

@Controller('/api/backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  @Get('/available')
  async available(@Req() request: Request): Promise<any> {
    this.logger.debug('available');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/backup/available',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/config')
  async get_config(@Req() request: Request): Promise<any> {
    this.logger.debug('available');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/backup/config',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/config')
  async set_config(@Req() request: Request, @Body() body: any): Promise<any> {
    this.logger.debug('set_config');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/backup/config',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/create')
  async crate_backup(@Req() request: Request, @Body() body: any): Promise<any> {
    this.logger.debug('create_backup');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/backup/create',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/get/:name')
  async get_backup(@Req() request: Request, @Param('name') name): Promise<any> {
    this.logger.debug('get_backup ' + name);
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/backup/get/' + name,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/list')
  async list_backup(@Req() request: Request): Promise<any> {
    this.logger.debug('list_backup');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/backup/list',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/backupSchedule')
  async set_backup_schedule(
    @Req() request: Request,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('backup_schedule');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/backup/schedule',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/backupSchedule')
  async get_backup_schedule(@Req() request: Request): Promise<any> {
    this.logger.debug('backup_schedule');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/backup/schedule',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
