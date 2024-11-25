import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('credential_schemas')
export class CredentialSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column()
    author: string;

    @Column('jsonb')
    schema: {
        $schema: string;
        type: string;
        properties: {
            [key: string]: {
                type: string;
                format?: string;
                pattern?: string;
                minLength?: number;
                maxLength?: number;
                minimum?: number;
                maximum?: number;
            };
        };
        required: string[];
    };

    @Column('simple-array')
    credentialTypes: string[];

    @Column({ nullable: true })
    schemaUri: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}