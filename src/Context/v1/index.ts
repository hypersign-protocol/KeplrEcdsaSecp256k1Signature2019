//@ts-ignore
import jsonld from "jsonld";

const nodeDocumentLoader = jsonld.documentLoader;
import ecdsasecp2019 from "./lds-ecdsa-secp256k1-recovery2019.json";

const CONTEXTS: any = Object.freeze({
  "https://ns.did.ai/suites/secp256k1-2019/v1/": {
    ...ecdsasecp2019,
  },
});

const docloader = async (url: string, options: any) => {
  if (url in CONTEXTS) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: CONTEXTS[url], // this is the actual document that was loaded
      documentUrl: url, // this is the actual context URL after redirects
    };
  }
  return nodeDocumentLoader(url);
};

export { docloader, CONTEXTS };
