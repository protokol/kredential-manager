import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Did } from '../entities/did.entity';
import { DidService } from './did.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Did])
    ],
    providers: [DidService],
    exports: [DidService]
})
export class DidModule { }