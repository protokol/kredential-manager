import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('credential_schemas')
export class CredentialSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column('jsonb')
    schema: Record<string, any>;

    @Column('simple-array')
    templateVariables: string[];

    @Column('jsonb')
    validationRules: {
        [key: string]: {
            type: string;
            required?: boolean;
            pattern?: string;
            minLength?: number;
            maxLength?: number;
            enum?: string[];
        }
    };

    @Column()
    format: string;

    @Column('simple-array')
    types: string[];

    @Column('jsonb')
    trust_framework: {
        name: string;
        type: string;
        uri: string;
    };

    @Column('jsonb')
    display: {
        name: string;
        locale: string;
    }[];

    @Column({ nullable: true })
    issuance_criteria?: string;

    @Column('simple-array', { nullable: true })
    supported_evidence_types?: string[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}