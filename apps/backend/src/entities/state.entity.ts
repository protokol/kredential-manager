import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    step: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    acceptanceToken: string;

    @Column()
    clientId: string;

    @Column({ nullable: true })
    walletDefinedState: string;

    @Column({ nullable: true })
    walletDefinedNonce: string;

    @Column({ nullable: true })
    serverDefinedState: string;

    @Column({ nullable: true })
    serverDefinedNonce: string;

    @Column({ nullable: true })
    redirectUri: string;

    @Column({ nullable: true })
    scope: string;

    @Column({ nullable: true })
    responseType: string;

    @Column({ nullable: true })
    codeChallenge: string;

    @Column({ nullable: true })
    codeChallengeMethod: string;

    @Column({ nullable: true })
    cNonce: string;

    @Column({ nullable: true })
    cNonceExpiresIn: number;

    @Column({ nullable: true })
    preAuthorisedCode: string;

    @Column({ nullable: true })
    preAuthorisedCodePin: string;

    @Column({ nullable: true })
    preAuthorisedCodeIsUsed: boolean;

    @Column('json', { nullable: true })
    payload: any;

    @CreateDateColumn()
    createdAt: Date;
}