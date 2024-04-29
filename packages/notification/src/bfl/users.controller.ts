import {
  Controller,
  Logger,
  Get,
  Post,
  Req,
  Param,
  Delete,
  Put,
  Body,
} from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  @Post('/')
  async create_user(@Req() request: Request, @Body() body: any): Promise<any> {
    this.logger.debug('create_user');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/iam/v1alpha1/users',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/')
  async list_users(@Req() request: Request): Promise<any> {
    this.logger.debug('list_users');
    const data: any = await createInstance(request).get(
      '/bfl/iam/v1alpha1/users',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/:username')
  async get_user_info(
    @Req() request: Request,
    @Param('username') username,
  ): Promise<any> {
    this.logger.debug('get_user_info ' + username);
    const data: any = await createInstance(request).get(
      '/bfl/iam/v1alpha1/users/' + username,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Delete('/:username')
  async delete_user(
    @Req() request: Request,
    @Param('username') username,
  ): Promise<any> {
    this.logger.debug('delete_user ' + username);
    const data: any = await createInstance(request).delete(
      '/bfl/iam/v1alpha1/users/' + username,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Put('/:username/password')
  async reset_password(
    @Req() request: Request,
    @Param('username') username,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('reset_password ' + username);
    this.logger.debug(body);
    const data: any = await createInstance(request).put(
      '/bfl/iam/v1alpha1/users/' + username + '/password',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Get('/:username/status')
  async account_status(
    @Req() request: Request,
    @Param('username') username,
  ): Promise<any> {
    this.logger.debug('account_status ' + username);
    const data: any = await createInstance(request).get(
      '/bfl/iam/v1alpha1/users/' + username + '/status',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
