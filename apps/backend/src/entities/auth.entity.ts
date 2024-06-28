import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation } from "typeorm";

@Entity()
export class Authorization {
    @PrimaryGeneratedColumn()
    authorization_id: number;

    @Column()
    client_id: string;

    @Column()
    response_type: string;

    @Column()
    scope: string;

    @Column()
    state: string;

    @Column()
    redirect_uri: string;

    @Column()
    nonce: string;

    @Column()
    created_at: Date;

    @Column()
    expires_at: Date;

    @Column()
    requested_credentials: string;
}