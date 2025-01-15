import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CredentialStatusList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    issuer: string;

    @Column()
    statusPurpose: 'revocation' | 'suspension';

    @Column('text')
    encodedList: string; // Base64 encoded compressed bitstring

    @Column({ nullable: true })
    validFrom: Date;

    @Column({ nullable: true })
    validUntil: Date;

    @OneToMany('CredentialStatusEntry', 'statusList')
    entries: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 