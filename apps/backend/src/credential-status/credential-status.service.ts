import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialStatusList } from '../entities/credential-status-list.entity';
import { CredentialStatusEntry } from '../entities/credential-status-entry.entity';
import * as crypto from 'crypto';
import * as zlib from 'zlib';

@Injectable()
export class CredentialStatusService {
    constructor(
        @InjectRepository(CredentialStatusList)
        private statusListRepo: Repository<CredentialStatusList>,
        @InjectRepository(CredentialStatusEntry)
        private statusEntryRepo: Repository<CredentialStatusEntry>
    ) { }

    private readonly LIST_SIZE = 131072; // 16KB minimum size

    async createStatusList(
        issuer: string,
        options?: {
            validUntil?: Date
        }
    ): Promise<CredentialStatusList> {
        const bitArray = new Uint8Array(this.LIST_SIZE);
        const compressed = zlib.gzipSync(bitArray);
        const encoded = compressed.toString('base64');

        const now = new Date();

        const statusList = this.statusListRepo.create({
            issuer,
            statusPurpose: 'revocation',
            encodedList: encoded,
            validFrom: now,
            validUntil: options?.validUntil || null,
        });

        return this.statusListRepo.save(statusList);
    }

    async addCredential(credentialId: string, statusListId: string): Promise<number> {
        const statusList = await this.statusListRepo.findOne({
            where: { id: statusListId },
            relations: ['entries']
        });

        if (!statusList) {
            throw new Error('Status list not found');
        }

        const usedIndices = new Set(statusList.entries.map(entry => entry.statusListIndex));

        let attempts = 0;
        const MAX_ATTEMPTS = 100;
        let randomIndex: number;

        do {
            randomIndex = crypto.randomInt(0, this.LIST_SIZE - 1);
            attempts++;

            if (attempts >= MAX_ATTEMPTS) {
                throw new Error('Status list is too full, create a new one');
            }
        } while (usedIndices.has(randomIndex));

        const entry = this.statusEntryRepo.create({
            credentialId,
            statusListIndex: randomIndex,
            statusList,
        });

        await this.statusEntryRepo.save(entry);
        return randomIndex;
    }

    async revokeCredential(credentialId: string): Promise<void> {
        const entry = await this.statusEntryRepo.findOne({
            where: { credentialId },
            relations: ['statusList']
        });

        if (!entry) {
            throw new Error('Credential not found in status list');
        }

        // Update bitstring
        const compressed = Buffer.from(entry.statusList.encodedList, 'base64');
        const bitArray = new Uint8Array(zlib.gunzipSync(compressed));
        bitArray[entry.statusListIndex] = 1;

        // Compress and encode updated bitstring
        const newCompressed = zlib.gzipSync(bitArray);
        const newEncoded = newCompressed.toString('base64');

        // Update database
        entry.revoked = true;
        entry.statusList.encodedList = newEncoded;

        await this.statusListRepo.save(entry.statusList);
        await this.statusEntryRepo.save(entry);
    }

    async verifyCredentialStatus(credentialId: string): Promise<boolean> {
        const entry = await this.statusEntryRepo.findOne({
            where: { credentialId },
            relations: ['statusList']
        });

        if (!entry) {
            throw new Error('Credential not found in status list');
        }

        const compressed = Buffer.from(entry.statusList.encodedList, 'base64');
        const bitArray = new Uint8Array(zlib.gunzipSync(compressed));
        return bitArray[entry.statusListIndex] === 0;
    }

    async getOrCreateStatusList(issuer: string): Promise<CredentialStatusList> {
        const currentList = await this.statusListRepo.findOne({
            where: { issuer },
            relations: ['entries'],
            order: { createdAt: 'DESC' }
        });

        if (currentList && currentList.entries.length < this.LIST_SIZE * 0.8) {
            return currentList;
        }

        return this.createStatusList(issuer);
    }

    async getStatusList(id: string) {
        const statusList = await this.statusListRepo.findOne({
            where: { id },
            relations: ['entries']
        });

        if (!statusList) {
            throw new Error('Status list not found');
        }

        const credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://w3id.org/vc/status-list/2021/v1"
            ],
            "id": `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}`,
            "type": ["VerifiableCredential", "StatusList2021Credential"],
            "issuer": statusList.issuer,
            "issuanceDate": statusList.createdAt.toISOString(),
            "credentialSubject": {
                "id": `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}#list`,
                "type": "StatusList2021",
                "statusPurpose": statusList.statusPurpose,
                "encodedList": statusList.encodedList
            }
        };

        // Add optional validity dates if they exist
        if (statusList.validFrom) {
            credential['validFrom'] = statusList.validFrom.toISOString();
        }
        if (statusList.validUntil) {
            credential['validUntil'] = statusList.validUntil.toISOString();
        }

        return credential;
    }
} 