var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//@ts-ignore
import jsonld from "jsonld";
const nodeDocumentLoader = jsonld.documentLoader;
import ecdsasecp2019 from "./lds-ecdsa-secp256k1-recovery2019.json";
const CONTEXTS = Object.freeze({
    "https://ns.did.ai/suites/secp256k1-2019/v1/": Object.assign({}, ecdsasecp2019),
});
const docloader = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (url in CONTEXTS) {
        return {
            contextUrl: null, // this is for a context via a link header
            document: CONTEXTS[url], // this is the actual document that was loaded
            documentUrl: url, // this is the actual context URL after redirects
        };
    }
    return nodeDocumentLoader(url);
});
export { docloader, CONTEXTS };