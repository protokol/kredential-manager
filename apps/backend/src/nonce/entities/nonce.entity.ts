import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Nonce {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nonce: string;

    @Column()
    code: string;

    @Column()
    step: string;

    @Column()
    status: string;

    @Column()
    clientId: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column('json')
    payload: any;
}