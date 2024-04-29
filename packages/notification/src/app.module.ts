import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { WebSocketController } from './websocket.controller';
import { WebSocketService } from './websocket.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BFLModule } from './bfl/bfl.module';

@Module({
  imports: [BFLModule, ScheduleModule.forRoot()],
  controllers: [NotificationController, WebSocketController],
  providers: [WebSocketService],
})
export class AppModule {}
