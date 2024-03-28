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
export class EcdsaSecp256k1VerificationKey2019 extends suites.LinkedDataSignature {
    constructor(options) {
        super({
            type: "EcdsaSecp256k1VerificationKey2019",
        });
        this.bech32AddressPrefix = options.bech32AddressPrefix;
        this.chainId = options.chainId;
        this.cosmosProvider = options.provider;
        this.proof = {
            type: "EcdsaSecp256k1VerificationKey2019",
        };
        this.proofSignatureKey = "proofValue";
    }
    generateKeyPair(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            return Error("Method not implemented");
        });
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
            console.log(proof);
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
            const keys = yield this.cosmosProvider.getKey(this.chainId);
            const bec32Address = keys.bech32Address;
            const signature = yield this.cosmosProvider.signArbitrary(this.chainId, bec32Address, signData);
            return signature;
        });
    }
    createProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let proof = this.proof;
            if (options.verificationMethod !== undefined &&
                typeof options.verificationMethod !== "object") {
                throw TypeError(`"verificationMethod" must be object`);
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
                documentLoader: options.documentLoader,
                expansionMap: options.expansionMap,
            });
            proof.verificationMethod = (_a = options.verificationMethod) === null || _a === void 0 ? void 0 : _a.id;
            proof.blockchainAccountId = (_b = options.verificationMethod) === null || _b === void 0 ? void 0 : _b.blockchainAccountId;
            proof.controller = (_c = options.verificationMethod) === null || _c === void 0 ? void 0 : _c.controller;
            proof.publickeyMultibase = (_d = options.verificationMethod) === null || _d === void 0 ? void 0 : _d.publickeyMultibase;
            const toBeSignedDocument = {
                message: options.document,
            };
            const canonizeDocument = yield this.createVerifyData({
                document: toBeSignedDocument.message,
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
            });
            console.log("Get Signature");
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
            const { bech32Address, pubKey, algo } = yield this.cosmosProvider.getKey(this.chainId);
            const signData = Buffer.from(data.message);
            const verified = yield verifyADR36Amino(this.bech32AddressPrefix, bech32Address, signData, pubKey, new Uint8Array(Buffer.from(data.signature, "base64")));
            return verified;
        });
    }
    verifyProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const canonizeDocument = yield this.createVerifyData({
                document: options.document,
                documentLoader: options.documentLoader
                    ? options.documentLoader
                    : docloader,
            });
            const signature = options.proof[this.proofSignatureKey];
            const { verificationMethod } = options.proof;
            const verified = yield this.verifySignature({
                message: canonizeDocument,
                signature,
            });
            return {
                verified,
                verificationMethod: {
                    id: verificationMethod,
                    controller: options.proof.controller,
                    publickeyMultibase: options.proof.publickeyMultibase,
                    type: options.proof.type,
                },
            };
        });
    }
}
