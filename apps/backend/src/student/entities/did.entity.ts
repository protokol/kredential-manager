import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    Relation,
} from "typeorm";
import { Student } from "./student.entity";
import { VerifiableCredential } from "./../../vc/entities/VerifiableCredential";

@Entity()
export class Did {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifier: string;

    @ManyToOne(() => Student, (student) => student.dids)
    student: Relation<Student>;
    verifiableCredential: any;

    @OneToMany(
        () => VerifiableCredential,
        (verifiableCredential) => verifiableCredential.did,
    )
    verifiableCredentials: VerifiableCredential[];
}
