import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nonce } from './entities/nonce.entity';
import { randomBytes } from 'crypto';
import { AuthNonce } from './interfaces/auth-nonce.interface';
import { NonceStep } from './enum/step.enum';
import { NonceStatus } from './enum/status.enum';

@Injectable()
export class NonceService {
    constructor(
        @InjectRepository(Nonce)
        private nonceRepository: Repository<Nonce>,
    ) { }

    async createAuthNonce(clientId: string, nonceValue: string, payload?: AuthNonce): Promise<string> {
        const nonce = this.nonceRepository.create({
            nonce: nonceValue,
            step: NonceStep.AUTHORIZE,
            status: NonceStatus.UNCLAIMED,
            code: '',
            clientId: clientId,
            createdAt: new Date(),
            payload: payload ?? {},
        });
        await this.nonceRepository.save(nonce);
        return nonceValue;
    }

    async createAuthResponseNonce(nonceValue: string, code: string): Promise<boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce) {
            nonce.step = NonceStep.AUTH_RESPONSE;
            nonce.status = NonceStatus.UNCLAIMED;
            nonce.code = code;
            await this.nonceRepository.save(nonce);
            return true;
        }
        return false;
    }

    async getNonce(nonceValue: string, step: NonceStep, status: NonceStatus, clientId?: string): Promise<Nonce | undefined> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce && nonce.step === step && nonce.status === status) {
            await this.updateNonceStatus(nonceValue, NonceStatus.CLAIMED);
            if (clientId && nonce.clientId !== clientId) {
                throw new Error('Invalid request');
            }
            return nonce;
        }
        throw new Error('Invalid nonce');
    }

    async getNonceByCode(code: string, step: NonceStep, status: NonceStatus, clientId?: string): Promise<Nonce | undefined> {
        const nonce = await this.nonceRepository.findOne({
            where: { code: code },
        });

        if (nonce && nonce.step === step && nonce.status === status) {
            await this.updateNonceStatus(nonce.nonce, NonceStatus.CLAIMED);
            if (clientId && nonce.clientId !== clientId) {
                throw new Error('Invalid request');
            }
            return nonce;
        }
        throw new Error('Invalid nonce');
    }

    private async updateNonceStatus(nonceValue: string, status: NonceStatus): Promise<Boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce) {
            nonce.status = status;
            await this.nonceRepository.save(nonce);
            return true;
        }
        return false;
    }

    async deleteNonce(nonceValue: string): Promise<Boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce) {
            await this.nonceRepository.remove(nonce);
            return true;
        }
        return false;
    }
}