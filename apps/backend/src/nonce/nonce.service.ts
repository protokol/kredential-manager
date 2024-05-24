import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nonce } from './entities/nonce.entity';
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

    async createAuthResponseNonce(nonceValue: string, code: string, idToken: string): Promise<boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce) {
            nonce.step = NonceStep.AUTH_RESPONSE;
            nonce.status = NonceStatus.UNCLAIMED;
            nonce.code = code;
            nonce.payload.idToken = idToken;
            await this.nonceRepository.save(nonce);
            return true;
        }
        return false;
    }

    async createTokenRequestCNonce(nonceValue: string, cNonce: string, cNonceExpiresIn: number): Promise<boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        // console.log('Saving c nonce: ', cNonce, nonceValue, nonce);

        if (nonce) {
            nonce.step = NonceStep.TOKEN_REQUEST;
            nonce.status = NonceStatus.UNCLAIMED;
            nonce.cNonce = cNonce;
            nonce.cNonceExpiresIn = cNonceExpiresIn;
            await this.nonceRepository.save(nonce);
            return true;
        }
        return false;
    }

    async createDeferredResoponse(nonceValue: string, acceptanceToken: string): Promise<boolean> {
        const nonce = await this.nonceRepository.findOne({
            where: { nonce: nonceValue },
        });

        if (nonce) {
            nonce.step = NonceStep.DEFERRED_REQUEST;
            nonce.status = NonceStatus.UNCLAIMED;
            nonce.acceptanceToken = acceptanceToken;
            await this.nonceRepository.save(nonce);
            return true;
        }
        return false;
    }

    async getNonceByField(fieldName: string, value: string, step: NonceStep, status: NonceStatus, clientId?: string): Promise<Nonce | undefined> {
        const nonce = await this.nonceRepository.findOne({
            where: { [fieldName]: value },
        });

        if (nonce && nonce.step === step && nonce.status === status) {
            // Don't update nonce status if it's a deferred request
            if (step !== NonceStep.DEFERRED_REQUEST) {
                await this.updateNonceStatus(nonce.nonce, NonceStatus.CLAIMED);
            }
            if (clientId && nonce.clientId !== clientId) {
                throw new Error('Invalid request');
            }
            return nonce;
        }
        switch (step) {
            case NonceStep.AUTHORIZE:
                throw new Error('Invalid nonce');
            case NonceStep.AUTH_RESPONSE:
                throw new Error('Invalid code');
            case NonceStep.TOKEN_REQUEST:
                throw new Error('Invalid nonce');
        }
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