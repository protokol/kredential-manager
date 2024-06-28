import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Nonce {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nonce: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    acceptanceToken: string;

    @Column({ nullable: true })
    cNonce: string;

    @Column({ nullable: true })
    cNonceExpiresIn: number;

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