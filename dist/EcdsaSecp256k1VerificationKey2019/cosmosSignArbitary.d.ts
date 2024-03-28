import { suites, purposes } from "jsonld-signatures";
export declare class EcdsaSecp256k1VerificationKey2019 extends suites.LinkedDataSignature {
    proof: Record<string, any>;
    chainId: string;
    LDKeyClass: any;
    signer: any;
    proofSignatureKey: string;
    cosmosProvider: any;
    bech32AddressPrefix: string;
    constructor(options: {
        chainId: string;
        bech32AddressPrefix: string;
        provider: any;
    });
    generateKeyPair(seed?: string): Promise<Error>;
    canonicalizationHash(c14nDocument: string): Promise<string>;
    canonize(message: object, options?: {
        documentLoader?: any;
        safe?: boolean;
    }): Promise<any>;
    canonizeProof(proof: any, documentLoader?: any): Promise<Record<string, any>>;
    getVerificationMethod(proof: any): string;
    createVerifyData(options: {
        document: any;
        documentLoader?: any;
    }): Promise<Record<string, any>[]>;
    sign(prams: {
        message: any;
        proof: any;
    }): Promise<any>;
    createProof(options: {
        readonly verificationMethod?: any;
        readonly date?: string | Date;
        readonly document: any;
        readonly purpose: purposes;
        documentLoader?: Function;
        expansionMap?: Function;
    }): Promise<Record<string, any>>;
    verifySignature(data: {
        message: any;
        signature: string;
    }): Promise<boolean>;
    verifyProof(options: {
        document: any;
        proof: any;
        documentLoader?: any;
    }): Promise<{
        verified: boolean;
        verificationMethod: {
            id: any;
            controller: any;
            publickeyMultibase: any;
            type: any;
        };
    }>;
}
