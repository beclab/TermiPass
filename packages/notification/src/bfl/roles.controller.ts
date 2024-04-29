import { Controller, Logger, Get, Post, Req } from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  @Get('/')
  async list_roles(@Req() request: Request): Promise<any> {
    this.logger.debug('list_roles');
    const data: any = await createInstance(request).get(
      '/bfl/iam/v1alpha1/roles',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
