import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VerifiableCredential {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb')
    payload: Record<string, any>;

    // Do we need this field?
    @Column({ default: false })
    isSigned: boolean;
}
