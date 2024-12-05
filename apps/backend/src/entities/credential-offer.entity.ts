import { CredentialOfferDetails, GrantType } from './../credential-offer/credential-offer.type';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { CredentialOfferData } from './credential-offer-data.entity';

@Entity('credential_offers')
export class CredentialOffer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    subject_did: string;

    @Column('simple-array', { nullable: true })
    credential_types: string[];

    @Column({ nullable: true })
    scope: string;

    @Column({ type: 'jsonb' })
    credential_offer_details: CredentialOfferDetails;

    @OneToOne(() => CredentialOfferData, { cascade: true, eager: true })
    @JoinColumn()
    credential_offer_data: CredentialOfferData;

    @Column({
        type: 'enum',
        enum: GrantType
    })
    grant_type: GrantType;

    @Column({ nullable: true })
    pin: string;

    @Column({
        type: 'enum',
        enum: ['PENDING', 'USED', 'EXPIRED'],
        default: 'PENDING'
    })
    status: string;

    @Column({ nullable: true })
    issuer_state: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    expires_at: Date;
}