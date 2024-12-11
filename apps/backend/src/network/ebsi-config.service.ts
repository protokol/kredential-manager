import { Injectable } from "@nestjs/common";
import { EbsiNetwork } from "./ebsi-network.types";
import { VerifyCredentialOptions } from "@cef-ebsi/verifiable-credential";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EbsiConfigService {
    constructor(private configService: ConfigService) { }

    private getNetworkSpecificConfig(network: string): Partial<VerifyCredentialOptions> {
        const configs = {
            conformance: {
                skipAccreditationsValidation: true,
                skipStatusValidation: true,
            },
            pilot: {
                timeout: 30_000,
            },
            production: {
                timeout: 60_000,
                skipAccreditationsValidation: false,
                skipStatusValidation: false,
            }
        };

        return configs[network] || {};
    }

    getVerifyCredentialOptions(network?: EbsiNetwork, overrides?: Partial<VerifyCredentialOptions>): VerifyCredentialOptions {
        const selectedNetwork = network ||
            this.configService.get<EbsiNetwork>('EBSI_NETWORK', EbsiNetwork.CONFORMANCE);

        const baseOptions: VerifyCredentialOptions = {
            network: selectedNetwork,
            hosts: [`api-${selectedNetwork}.ebsi.eu`],
        };

        return {
            ...baseOptions,
            ...this.getNetworkSpecificConfig(selectedNetwork),
            ...overrides
        };
    }
}