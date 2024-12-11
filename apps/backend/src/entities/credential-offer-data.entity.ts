
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CredentialOffer } from './credential-offer.entity';
import { SchemaTemplateData } from 'src/schemas/schema.types';


@Entity('credential_offer_data')
export class CredentialOfferData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('jsonb', { nullable: true })
    templateData: SchemaTemplateData;

    @Column()
    schemaTemplateId: number;
}