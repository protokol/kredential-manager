import { Did } from "../../student/entities/did.entity";
import { VCRole, VCStatus, VCSupportedTypes } from "../../types/VC";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Relation,
    OneToMany,
    ManyToOne,
} from "typeorm";

@Entity()
export class VerifiableCredential {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Did, (did) => did.verifiableCredentials, {})
    did: Relation<Did>;



    // @Column({ type: "text", nullable: true })
    // displayName: string;

    // @Column({ type: "text", nullable: true })
    // mail: string;

    // @Column({ type: "date", nullable: true })
    // dateOfBirth: Date;

    @Column({ type: "jsonb", default: {}, nullable: true })
    requested_credentials: Record<string, any>;

    @Column({ nullable: true })
    credential: string;

    @Column({
        default: {}, nullable: true
    })
    credential_signed: string;

    @Column({
        type: "enum",
        enum: VCSupportedTypes,
        nullable: false,
    })
    type: VCSupportedTypes;

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
