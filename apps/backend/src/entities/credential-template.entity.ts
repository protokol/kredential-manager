// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// @Entity('credential_templates')
// export class CredentialTemplate {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column()
//     name: string;

//     @Column()
//     version: string;

//     @Column('jsonb')
//     template: {
//         '@context': string[];
//         type: string[];
//         credentialSubject: {
//             [key: string]: string;
//         };
//         [key: string]: any;
//     };

//     @ManyToOne(() => CredentialSchema)
//     schema: CredentialSchema;

//     @Column()
//     schemaId: number;

//     @CreateDateColumn()
//     created_at: Date;

//     @UpdateDateColumn()
//     updated_at: Date;
// }