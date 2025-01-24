import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity()
export class CredentialStatusEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    credentialId: string;

    @Column()
    statusListIndex: number;

    @Column({ default: false })
    revoked: boolean;

    @Column({ nullable: true })
    reason?: string;

    @ManyToOne('CredentialStatusList', 'entries')
    statusList: any;

    @CreateDateColumn()
    createdAt: Date;
} 