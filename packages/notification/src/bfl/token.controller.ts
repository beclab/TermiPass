import { Controller, Logger, Get, Req, Post, Body } from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api')
export class TokenController {
  private readonly logger = new Logger(TokenController.name);

  @Post('/login')
  async login(@Req() request: Request, @Body() body: any): Promise<any> {
    this.logger.debug('login');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/iam/v1alpha1/login',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/refresh-token')
  async refreshToken(@Req() request: Request, @Body() body: any): Promise<any> {
    this.logger.debug('refresh-token');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/iam/v1alpha1/refresh-token',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
