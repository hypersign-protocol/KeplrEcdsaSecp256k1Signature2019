var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-ignore
import { suites } from "jsonld-signatures";
import { CONTEXTS } from "../Context/v1";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { base58btc } from "multiformats/bases/base58";
// @ts-ignore
import jsonld from "jsonld";
import crypto from "crypto";
import { w3cDate } from "../utils";
const nodeDocumentLoader = jsonld.documentLoader;
const docloader = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (url in CONTEXTS) {
        return {
            contextUrl: null, // this is for a context via a link header
            document: CONTEXTS[url], // this is the actual document that was loaded
            documentUrl: url, // this is the actual context URL after redirects
        };
    }
    // call the default documentLoader
    return nodeDocumentLoader(url);
});
export class EcdsaSecp256k1Signature2019 extends suites.LinkedDataSignature {
    constructor(options) {
        super({
            type: "EcdsaSecp256k1Signature2019",
        });
        this.bech32AddressPrefix = options.bech32AddressPrefix;
        this.chainId = options.chainId;
        this.cosmosProvider = options.provider;
        this.proof = {
            type: "EcdsaSecp256k1Signature2019",
        };
        this.proofSignatureKey = "proofValue";
    }
    generateKeyPair(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            return Error("Method not implemented");
        });
    }
    ensureSuiteContext(params) {
        return;
    }
    canonicalizationHash(c14nDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            const sha256 = crypto.createHash("sha256");
            let hash = sha256.update(c14nDocument);
            return hash.digest("hex");
        });
    }
    canonize(message, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const c14nDocument = yield jsonld.canonize(message, {
                algorithm: "URDNA2015",
                format: "application/n-quads",
                useNative: false,
                safe: (options === null || options === void 0 ? void 0 : options.safe) ? options.safe : false,
                documentLoader: (options === null || options === void 0 ? void 0 : options.documentLoader)
                    ? options.documentLoader
                    : docloader,
            });
            return c14nDocument;
        });
    }
    canonizeProof(proof, documentLoader) {
        return __awaiter(this, void 0, void 0, function* () {
            proof = Object.assign({}, proof);
            delete proof[this.proofSignatureKey];
            return this.canonize(proof, {
                documentLoader: documentLoader ? documentLoader : docloader,
            });
        });
    }
    getVerificationMethod(proof) {
        let verificationMethod = proof.verificationMethod;
        if (typeof verificationMethod === "object") {
            verificationMethod = verificationMethod.id;
        }
        if (!verificationMethod) {
            throw new Error('No "verificationMethod" found in proof.');
        }
        // TODO: resolve DID to check if DID belongs to the controller of the proof or the status of the DID
        return verificationMethod;
    }
    createVerifyData(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document } = options;
            const canonizeDocument = yield this.canonize(document, {
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
            });
            return canonizeDocument;
        });
    }
    sign(prams) {
        return __awaiter(this, void 0, void 0, function* () {
            const signData = Buffer.from(prams.message);
            let keys;
            let bec32Address;
            if (this.cosmosProvider.getKey) {
                keys = yield this.cosmosProvider.getKey(this.chainId);
                bec32Address = keys.bech32Address;
            }
            else {
                keys = yield this.cosmosProvider.getAccount(this.chainId);
                console.log(keys);
                bec32Address = keys.address;
            }
            const signature = yield this.cosmosProvider.signArbitrary(this.chainId, bec32Address, signData);
            return signature;
        });
    }
    createProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let proof = this.proof;
            if (options.verificationMethod !== undefined &&
                typeof options.verificationMethod !== "string") {
                throw TypeError(`"verificationMethod" must be URI string`);
            }
            let date = options.date
                ? new Date(options.date).getTime()
                : undefined;
            if (date === undefined) {
                date = Date.now();
            }
            if (date !== undefined && typeof date !== "string") {
                date = w3cDate(date);
            }
            if (date !== undefined) {
                proof.created = date;
            }
            proof = yield options.purpose.update(proof, {
                document: options.document,
                suite: this,
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
                expansionMap: options.expansionMap,
            });
            proof.verificationMethod = options.purpose.controller.id;
            options.document.proof = proof;
            const toBeSignedDocument = {
                message: options.document,
            };
            const canonizeDocument = yield this.createVerifyData({
                document: toBeSignedDocument.message,
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
            });
            const signature = yield this.sign({
                message: canonizeDocument,
                proof,
            });
            proof[this.proofSignatureKey] = signature.signature;
            return proof;
        });
    }
    verifySignature(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const signData = Buffer.from(data.message);
            const verified = yield verifyADR36Amino(this.bech32AddressPrefix, data.bech32Address, signData, data.pubKey, new Uint8Array(Buffer.from(data.signature, "base64")));
            return verified;
        });
    }
    verifyProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verificationMethod } = options.proof;
            const vm = options.document.verificationMethod.find((elm) => {
                return elm.id == verificationMethod;
            });
            const bech32Address = vm.blockchainAccountId.split(":")[2];
            const pubKey = base58btc.decode(vm.publicKeyMultibase);
            options.document.proof = options.proof;
            const canonizeDocument = yield this.createVerifyData({
                document: options.document,
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
            });
            const signature = options.proof[this.proofSignatureKey];
            const verified = yield this.verifySignature({
                message: canonizeDocument,
                signature,
                bech32Address,
                pubKey,
            });
            return {
                verified,
                verificationMethod: {
                    id: options.proof.verificationMethod,
                },
            };
        });
    }
}
