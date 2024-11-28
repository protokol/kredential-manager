import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('presentation_definitions')
export class PresentationDefinition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column({ type: 'jsonb' })
    definition: {
        id: string;
        format: {
            jwt_vp: { alg: string[] };
            jwt_vc: { alg: string[] };
        };
        input_descriptors: Array<{
            id: string;
            format: { jwt_vc: { alg: string[] } };
            constraints: {
                fields: Array<{
                    path: string[];
                    filter: {
                        type: string;
                        contains: { const: string };
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