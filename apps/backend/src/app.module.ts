import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      synchronize: true, // TODO: disable this in production !!!
      entities: [User],
      migrations: ['src/migrations/*.ts'],
      migrationsTableName: 'custom_migration_table',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
