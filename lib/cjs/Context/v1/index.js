"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTEXTS = exports.docloader = void 0;
const did_json_1 = __importDefault(require("./did.json"));
const ed25519_signature_2020_json_1 = __importDefault(require("./ed25519-signature-2020.json"));
const security_v2_json_1 = __importDefault(require("./security-v2.json"));
const credentials_json_1 = __importDefault(require("./credentials.json"));
const EthereumEip712Signature2021_json_1 = __importDefault(require("./EthereumEip712Signature2021.json"));
// @ts-ignore
const jsonld_1 = __importDefault(require("jsonld"));
const schemaOrg_json_1 = __importDefault(require("../schemaOrg.json"));
const vc_data_integrety_json_1 = __importDefault(require("./vc-data-integrety.json"));
const lds_ecdsa_secp256k1_recovery2020_json_1 = __importDefault(require("./lds-ecdsa-secp256k1-recovery2020.json"));
const secp256k1v1_json_1 = __importDefault(require("./secp256k1v1.json"));
const ld_ecdsa_secp256k1_2019_json_1 = __importDefault(require("./ld-ecdsa-secp256k1_2019.json"));
// Ref: https://github.com/digitalbazaar/jsonld.js/#custom-document-loader
// @ts-ignore
const nodeDocumentLoader = jsonld_1.default.documentLoader;
const CONTEXTS = Object.freeze({
    "https://w3id.org/security/suites/eip712sig-2021/v1": Object.assign({}, EthereumEip712Signature2021_json_1.default),
    "https://schema.org": schemaOrg_json_1.default,
    "https://www.w3.org/ns/did/v1": Object.assign({}, did_json_1.default),
    "https://ns.did.ai/suites/secp256k1-2020/v1": Object.assign({}, secp256k1v1_json_1.default),
    "https://ns.did.ai/suites/secp256k1-2020/v1/": Object.assign({}, secp256k1v1_json_1.default),
    "https://w3id.org/security/suites/ed25519-2020/v1": Object.assign({}, ed25519_signature_2020_json_1.default),
    "https://ns.did.ai/suites/secp256k1-2019/v1": Object.assign({}, ld_ecdsa_secp256k1_2019_json_1.default),
    "https://w3id.org/security/v2": Object.assign({}, security_v2_json_1.default),
    "https://www.w3.org/2018/credentials/v1": Object.assign({}, credentials_json_1.default),
    "https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.jsonld": Object.assign({}, vc_data_integrety_json_1.default),
    "https://w3id.org/security/suites/secp256k1recovery-2020/v2": Object.assign({}, lds_ecdsa_secp256k1_recovery2020_json_1.default),
});
exports.CONTEXTS = CONTEXTS;
const docloader = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (url in CONTEXTS) {
        return {
            contextUrl: null, // this is for a context via a link header
            document: CONTEXTS[url], // this is the actual document that was loaded
            documentUrl: url, // this is the actual context URL after redirects
            tag: "static",
        };
    }
    return nodeDocumentLoader(url);
});
exports.docloader = docloader;
