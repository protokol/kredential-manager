import { VCRole, VCStatus, VCSupportedTypes } from "src/types/VC";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class VerifiableCredential {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", nullable: false })
    did: string;

    @Column({ type: "text", nullable: true })
    displayName: string;

    @Column({ type: "text", nullable: true })
    mail: string;

    @Column({ type: "date", nullable: true })
    dateOfBirth: Date;

    @Column({ type: "jsonb", nullable: false })
    vc_data: Record<string, any>;

    @Column({ type: "jsonb", default: {}, nullable: true })
    vc_data_signed: Record<string, any>;

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
}