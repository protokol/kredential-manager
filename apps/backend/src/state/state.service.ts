import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '@entities/state.entity';
import { StateStep } from './enum/step.enum';
import { StateStatus } from './enum/status.enum';

@Injectable()
export class StateService {
    constructor(
        @InjectRepository(State)
        private stateRepository: Repository<State>,
    ) { }

    async createAuthState(clientId: string, codeChallenge: string, codeChallengeMethod: string, redirectUri: string, scope: string, responseType: string, serverDefinedState: string, serverDefinedNonce: string, walletDefinedState: string, walletDefinedNonce?: string, payload?: any) {
        const state = this.stateRepository.create({
            clientId,
            step: StateStep.AUTHORIZE,
            status: StateStatus.UNCLAIMED,
            codeChallenge,
            codeChallengeMethod,
            redirectUri,
            scope,
            responseType,
            serverDefinedState,
            serverDefinedNonce,
            walletDefinedState,
            walletDefinedNonce,
            payload: payload ?? {}
        });
        try {
            await this.stateRepository.save(state);
        } catch (error) {
            throw new Error(`Error creating state: ${error.message}`);
        }
    }

    async createVPRequestState(
        clientId: string,
        nonce: string,
        walletState: string,
        presentationDefinition: any
    ): Promise<void> {
        await this.stateRepository.save({
            clientId,
            nonce,
            walletState,
            presentationDefinition,
            step: StateStep.VP_REQUEST,
            status: StateStatus.UNCLAIMED,
            created_at: new Date()
        });
    }

    async createAuthResponseNonce(id: number, code: string, idToken: string): Promise<boolean> {
        const state = await this.stateRepository.findOne({
            where: { id },
        });

        if (state) {
            state.step = StateStep.AUTH_RESPONSE;
            state.status = StateStatus.UNCLAIMED;
            state.code = code;
            state.payload.idToken = idToken;
            await this.stateRepository.save(state);
            return true;
        }
        return false;
    }

    async createTokenRequestCNonce(id: number, cNonce: string, cNonceExpiresIn: number): Promise<boolean> {
        const nonce = await this.stateRepository.findOne({
            where: { id },
        });

        if (nonce) {
            nonce.step = StateStep.TOKEN_REQUEST;
            nonce.status = StateStatus.UNCLAIMED;
            nonce.cNonce = cNonce;
            nonce.cNonceExpiresIn = cNonceExpiresIn;
            await this.stateRepository.save(nonce);
            return true;
        }
        return false;
    }

    async createDeferredResoponse(id: number, acceptanceToken: string): Promise<boolean> {
        const state = await this.stateRepository.findOne({
            where: { id },
        });

        if (state) {
            state.step = StateStep.DEFERRED_REQUEST;
            state.status = StateStatus.UNCLAIMED;
            state.acceptanceToken = acceptanceToken;
            await this.stateRepository.save(state);
            return true;
        }
        return false;
    }

    async validatePreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string) {
        const state = await this.stateRepository.findOne({
            where: { preAuthorisedCode: preAuthorisedCode, preAuthorisedCodePin: pinCode },
        });
        if (!state) {
            return false;
        }
        return !state.preAuthorisedCodeIsUsed;
    }

    async createPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string, did: string, requestedCredentials: string[]) {
        const state = await this.stateRepository.findOne({
            where: { preAuthorisedCode: preAuthorisedCode, preAuthorisedCodePin: pinCode },
        });

        if (state) {
            throw new Error('Pre-authorised code and pin code already exists');
        }

        const newState = this.stateRepository.create({
            clientId: did,
            payload: {
                authorizationDetails: [
                    {
                        types: requestedCredentials
                    }
                ]
            },
            step: StateStep.TOKEN_REQUEST,
            status: StateStatus.UNCLAIMED,
            preAuthorisedCode,
            preAuthorisedCodePin: pinCode,
            preAuthorisedCodeIsUsed: false,
        });
        try {
            await this.stateRepository.save(newState);
        } catch (error) {
            throw new Error(`Error creating state: ${error.message}`);
        }
    }

    private async updateStatus(id: number, status: StateStatus): Promise<Boolean> {
        const nonce = await this.stateRepository.findOne({
            where: { id: id },
        });

        if (nonce) {
            nonce.status = status;
            await this.stateRepository.save(nonce);
            return true;
        }
        return false;
    }

    async getByField(fieldName: string, value: string, step: StateStep, status: StateStatus, clientId?: string): Promise<State | undefined> {
        const state = await this.stateRepository.findOne({
            where: { [fieldName]: value },
        });

        return state

        if (state && state.step === step && state.status === status) {
            // Don't update state status if it's a deferred request
            if (step !== StateStep.DEFERRED_REQUEST) {
                await this.updateStatus(state.id, StateStatus.CLAIMED);
            }
            if (clientId && state.clientId !== clientId) {
                throw new Error('Invalid request');
            }
            return state;
        }
        switch (step) {
            case StateStep.AUTHORIZE:
                throw new Error('Invalid state');
            case StateStep.AUTH_RESPONSE:
                throw new Error('Invalid code');
            case StateStep.TOKEN_REQUEST:
                throw new Error('Invalid state');
        }
    }

    async getByPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string,): Promise<State | undefined> {
        return await this.stateRepository.findOne({ where: { preAuthorisedCode, preAuthorisedCodePin: pinCode } });
    }

    // Conformance Testing
    async deleteByPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string): Promise<void> {
        await this.stateRepository.delete({ preAuthorisedCode, preAuthorisedCodePin: pinCode });
    }

}