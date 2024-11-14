import { CredentialOfferData, GrantType } from './../credential-offer/credential-offer.type';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity('credential_offers')
export class CredentialOffer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    did: string;

    @Column('simple-array')
    credential_types: string[];

    @Column({ type: 'jsonb' })
    credential_offer: CredentialOfferData;

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

    @CreateDateColumn()
    created_at: Date;

    @Column()
    expires_at: Date;
}