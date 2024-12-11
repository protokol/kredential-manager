import { Did } from "./did.entity";
import { VCRole, VCStatus, VCSupportedTypes } from "../types/VC";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Relation,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { CredentialOffer } from "./credential-offer.entity";

@Entity()
export class VerifiableCredential {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Did, (did) => did.verifiableCredentials, {})
    did: Relation<Did>;

    @Column({ type: "jsonb", default: {}, nullable: true })
    requested_credentials: Record<string, any>;

    @OneToOne(() => CredentialOffer, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn()
    offer: CredentialOffer;

    @Column({ nullable: true })
    credential: string;

    @Column({
        default: {}, nullable: true
    })
    credential_signed: string;

    @Column({
        type: "enum",
        enum: VCRole,
        default: VCRole.STUDENT,
    })
    role: VCRole;

    @Column({
        type: "enum",
        enum: VCStatus,
        default: VCStatus.PENDING,
    })
    status: VCStatus;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    issued_at: Date;
}
