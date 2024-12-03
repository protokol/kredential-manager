import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('presentation_definitions')
@Unique(['scope'])
export class PresentationDefinition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column({ unique: true, nullable: false })
    scope: string;

    @Column({ type: 'jsonb' })
    definition: {
        id: string;
        name?: string;
        purpose?: string;
        format: {
            jwt_vp: { alg: string[] };
            jwt_vp_json?: { alg: string[] };
            jwt_vc: { alg: string[] };
            jwt_vc_json?: { alg: string[] };
        };
        submission_requirements?: Array<{
            name?: string;
            purpose?: string;
            rule: 'all' | 'pick';
            count?: number;
            from: string;
            from_nested?: Array<{
                name?: string;
                purpose?: string;
                rule: 'all' | 'pick';
                count?: number;
                from: string;
            }>;
        }>;
        input_descriptors: Array<{
            id: string;
            name?: string;
            purpose?: string;
            format: {
                jwt_vc: { alg: string[] };
                jwt_vc_json?: { alg: string[] };
            };
            constraints: {
                fields: Array<{
                    path: string[];
                    filter: {
                        type: string;
                        contains: { const: string } | { anyOf: { const: string }[] };
                    };
                }>;
            };
        }>;
    };

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}