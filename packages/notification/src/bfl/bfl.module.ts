import { Module } from '@nestjs/common';
import { UpgradeController } from './upgrade.controller';
import { BackendController } from './backend.controller';
import { BackupController } from './backup.controller';
import { RolesController } from './roles.controller';
import { UsersController } from './users.controller';
import { NetworkPolicyController } from './network.controller';
import { ApplicationController } from './application.controller';
import { MonitorController } from './monitor.controller';
import { TokenController } from './token.controller';
import { DataStoreController } from './datastore.controller';

@Module({
  imports: [],
  controllers: [
    UpgradeController,
    BackendController,
    BackupController,
    RolesController,
    UsersController,
    NetworkPolicyController,
    ApplicationController,
    MonitorController,
    TokenController,
    DataStoreController,
  ],
  providers: [],
  //exports: [AppStoreController, AppStoreService],
})
export class BFLModule {}
