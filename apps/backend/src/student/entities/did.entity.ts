import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Student } from "./student.entity";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";

@Entity()
export class Did {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifier: string;

    @ManyToOne(() => Student, (student) => student.dids)
    student: Student;
    verifiableCredential: any;

    @OneToMany(
        () => VerifiableCredential,
        (verifiableCredential) => verifiableCredential.did,
    )
    verifiableCredentials: VerifiableCredential[];
}
