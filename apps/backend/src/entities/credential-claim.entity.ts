import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, Index, OneToMany } from 'typeorm';
import { VerifiableCredential } from './verifiableCredential.entity';
import { CredentialOffer } from './credential-offer.entity';

export enum ClaimStatus {
    PENDING = 'PENDING',
    CLAIMED = 'CLAIMED',
    FAILED = 'FAILED'
}

export enum CredentialType {
    IN_TIME = 'CTWalletSameAuthorisedInTime',
    DEFERRED = 'CTWalletSameAuthorisedDeferred',
    PRE_AUTH_IN_TIME = 'CTWalletSamePreAuthorisedInTime',
    PRE_AUTH_DEFERRED = 'CTWalletSamePreAuthorisedDeferred'
}

@Entity()
export class CredentialClaim {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    holderDid: string;

    @Column({
        type: 'enum',
        enum: CredentialType
    })
    credentialType: CredentialType;

    @Column({
        type: 'enum',
        enum: ClaimStatus,
        default: ClaimStatus.PENDING
    })

    @Index()
    status: ClaimStatus;

    @Column({ nullable: true })
    qrCode: string;

    @ManyToOne(() => VerifiableCredential, { nullable: true })
    credential: VerifiableCredential;

    @ManyToOne(() => CredentialOffer, { nullable: false })
    offer: CredentialOffer;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    claimedAt: Date;
} 