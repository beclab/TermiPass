import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WsStartGateway } from './ws.gateway';
import { CallbackController } from './callback.controller';
import { SettingsController } from './settings.controller';
import { NFTController } from './nft.controller';
import { LoginController } from './login.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    CallbackController,
    SettingsController,
    NFTController,
    LoginController,
  ],
  providers: [WsStartGateway],
})
export class AppModule {}
