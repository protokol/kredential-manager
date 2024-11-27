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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}