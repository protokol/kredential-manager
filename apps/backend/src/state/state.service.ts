import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository, UpdateResult } from 'typeorm';
import { State } from '@entities/state.entity';
import { StateStep } from './enum/step.enum';
import { StateStatus } from './enum/status.enum';
import { CredentialOffer } from '@entities/credential-offer.entity';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';

@Injectable()
export class StateService {
    constructor(
        @InjectRepository(State)
        private stateRepository: Repository<State>,
        @InjectRepository(CredentialOffer)
        private credentialOfferRepository: Repository<CredentialOffer>,
        @InjectRepository(CredentialOfferData)
        private credentialOfferDataRepository: Repository<CredentialOfferData>,
    ) { }

    async createAuthState(clientId: string, codeChallenge: string, codeChallengeMethod: string, redirectUri: string, scope: string, responseType: string, serverDefinedState: string, serverDefinedNonce: string, walletDefinedState: string, walletDefinedNonce?: string, payload?: any, offer?: CredentialOffer) {
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
            payload: payload ?? {},
            offer
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

    async createPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string, did: string, requestedCredentials: string[], offer?: CredentialOffer) {
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
            offer: offer
        });
        try {
            await this.stateRepository.save(newState);
        } catch (error) {
            throw new Error(`Error creating state: ${error.message}`);
        }
    }

    async updateStatus(id: number, status: StateStatus): Promise<Boolean> {
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
            relations: ['offer']
        });

        return state
    }

    async getByPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string,): Promise<State | undefined> {
        return await this.stateRepository.findOne({ where: { preAuthorisedCode, preAuthorisedCodePin: pinCode } });
    }

    // Conformance Testing
    async deleteByPreAuthorisedAndPinCode(pinCode: string, preAuthorisedCode: string): Promise<void> {
        await this.stateRepository.delete({ preAuthorisedCode, preAuthorisedCodePin: pinCode });
    }

    async createVerificationState(clientId: string, nonce: string, redirectUri: string, scope: string, responseType: string, serverDefinedState: string, serverDefinedNonce: string, walletDefinedState: string, walletDefinedNonce: string, presentationUri: string) {
        await this.stateRepository.save({
            clientId, nonce, redirectUri, scope, responseType, serverDefinedState, serverDefinedNonce, walletDefinedState, walletDefinedNonce, presentationUri,
            step: StateStep.VERIFICATION_REQUEST,
            status: StateStatus.UNCLAIMED,
        });
    }

    async getVerificationStateByState(state: string): Promise<State | undefined> {
        return await this.stateRepository.findOne({ where: { serverDefinedState: state } });
    }

    async getVerificationStateByWalletState(state: string): Promise<State | undefined> {
        return await this.stateRepository.findOne({ where: { walletDefinedState: state } });
    }
}
