import { Controller, Logger, Get, Req, Post, Body } from '@nestjs/common';
import { createInstance } from './utils';

// export enum TerminusStatus {
//   UNKNOWN = 0,
//   NORMAL = 1,
//   ERROR = 2,
// }

// export type MonitorState = {
//   usages: Usage[] | undefined;
//   net: Net | undefined;
//   status: TerminusStatus;
// };

@Controller('/api')
export class MonitorController {
  private readonly logger = new Logger(MonitorController.name);

  @Get('/monitor/cluster')
  async monitor(@Req() request: Request): Promise<any> {
    //request.cookies['x-authorization'];

    const data: any = await createInstance(request).get(
      '/bfl/monitor/v1alpha1/cluster',
      {},
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
    // console.log(response);
    // if (!response || response.status != 200 || !response.data) {
    //   return returnError(2, 'network error');
    // }

    // console.log(response.data);
    // if (response.data.code != 0) {
    //   return returnError(2, 'network error');
    // }

    // const res: MonitorState = {
    //   usages: undefined,
    //   net: undefined,
    //   status: TerminusStatus.UNKNOWN,
    // };
    // const data = response.data.data;
    // res.usages = [];
    // res.usages.push(data.cpu);
    // res.usages.push(data.memory);
    // res.usages.push(data.disk);

    // res.usages[0].name = 'cpu';
    // res.usages[0].color = 'color-FEF153';
    // res.usages[0].uint = '40';
    // res.usages[1].name = 'memory';
    // res.usages[1].color = 'color-ACF878';
    // res.usages[1].uint = '40';
    // res.usages[2].name = 'disk';
    // res.usages[2].color = 'color-5BCCF3';
    // res.usages[2].uint = '40';

    // res.net = data.net;
    // res.status = TerminusStatus.NORMAL;
    // return returnSucceed(res);
  }
}
