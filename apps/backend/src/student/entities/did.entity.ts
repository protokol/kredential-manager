import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    Relation,
    ManyToMany
} from "typeorm";
import { Student } from "./student.entity";
import { VerifiableCredential } from "./../../vc/entities/VerifiableCredential";

@Entity()
export class Did {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    identifier: string;

    @ManyToOne(() => Student, (student) => student.dids)
    student: Relation<Student>;

    @OneToMany(() => VerifiableCredential, verifiableCredential => verifiableCredential.did)
    verifiableCredentials: VerifiableCredential[];
    // @OneToMany(
    //     () => VerifiableCredential,
    //     (verifiableCredential) => verifiableCredential.did,
    // )
    // verifiableCredentials: VerifiableCredential[];

    // @ManyToOne(() => VerifiableCredential, (vc) => vc.did)
    // verifiableCredential: Relation<VerifiableCredential>;
    // verifiableCredential: any;

    // @ManyToOne(() => VerifiableCredential)
    // verifiableCredentials: Relation<VerifiableCredential>;
    // verifiableCredentials: VerifiableCredential[];
    // @OneToMany(
    //     () => VerifiableCredential,
    //     (verifiableCredential) => verifiableCredential.did,
    // )
    // verifiableCredentials: VerifiableCredential[];
}
