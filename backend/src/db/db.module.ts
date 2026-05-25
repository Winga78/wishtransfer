import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { databaseProviders } from './db.providers'; 
import { ConfigModule } from '@nestjs/config';
@Module({
   imports: [ConfigModule],
   providers: [...databaseProviders],
   exports: [...databaseProviders],
})
export class DbModule {}
