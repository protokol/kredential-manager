import { Entity, PrimaryGeneratedColumn, JoinColumn, Unique, OneToOne } from 'typeorm';
import { PresentationDefinition } from './presentation-definition.entity';
import { CredentialSchema } from './credential-schema.entity';

@Entity('scope_credential_mappings')
@Unique(['presentationDefinition'])
export class ScopeCredentialMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => PresentationDefinition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'presentation_definition_id' })
    presentationDefinition: PresentationDefinition;

    @OneToOne(() => CredentialSchema, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'credential_schema_id' })
    credentialSchema: CredentialSchema;
}