// @ts-ignore
import { suites, purposes } from "jsonld-signatures";
import { CONTEXTS } from "../Context/v1";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
// @ts-ignore
import jsonld from "jsonld";
import crypto from "crypto";
import { w3cDate } from "../utils";
const nodeDocumentLoader = jsonld.documentLoader;

const docloader = async (url: any, options: any) => {
  if (url in CONTEXTS) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: CONTEXTS[url], // this is the actual document that was loaded
      documentUrl: url, // this is the actual context URL after redirects
    };
  }
  // call the default documentLoader

  return nodeDocumentLoader(url);
};

export class EcdsaSecp256k1VerificationKey2019 extends suites.LinkedDataSignature {
  proof: Record<string, any>;
  chainId: string;
  LDKeyClass: any;
  signer: any;
  proofSignatureKey: string;
  cosmosProvider: any;
  bech32AddressPrefix;
  constructor(options: {
    chainId: string;
    bech32AddressPrefix: string;
    provider: any;
  }) {
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

  
  async generateKeyPair(seed?: string) {
    return Error("Method not implemented");
  }

  async canonicalizationHash(c14nDocument: string) {
    const sha256 = crypto.createHash("sha256");
    let hash = sha256.update(c14nDocument);
    return hash.digest("hex");
  }

  async canonize(
    message: object,
    options?: {
      documentLoader?: any;
      safe?: boolean;
    }
  ) {
    const c14nDocument = await jsonld.canonize(message, {
      algorithm: "URDNA2015",
      format: "application/n-quads",
      useNative: false,
      safe: options?.safe ? options.safe : false,
      documentLoader: options?.documentLoader
        ? options.documentLoader
        : docloader,
    });
    return c14nDocument;
  }
  async canonizeProof(
    proof: any,
    documentLoader?: any
  ): Promise<Record<string, any>> {
    console.log(proof);

    proof = { ...proof };
    delete proof[this.proofSignatureKey];

    return this.canonize(proof, {
      documentLoader: documentLoader ? documentLoader : docloader,
    });
  }

  getVerificationMethod(proof: any): string {
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

  async createVerifyData(options: {
    document: any;
    documentLoader?: any;
  }): Promise<Record<string, any>[]> {
    const { document } = options;

    const canonizeDocument = await this.canonize(document, {
      documentLoader: options.documentLoader
        ? options.documentLoader
        : docloader,
    });
    return canonizeDocument;
  }



  async sign(prams: { message: any ,proof:any }) {
    const signData = Buffer.from(prams.message);

    const keys = await this.cosmosProvider.getKey(this.chainId);
    const bec32Address = keys.bech32Address;
    const signature = await this.cosmosProvider.signArbitrary(
      this.chainId,
      bec32Address,
      signData
    );



    return signature;
  }
  async createProof(options: {
    readonly verificationMethod?: any;
    readonly date?: string | Date;
    readonly document: any;
    readonly purpose: purposes;
    documentLoader?: Function;
    expansionMap?: Function;
  }) {
    let proof: Record<string, any> = this.proof;

    if (
      options.verificationMethod !== undefined &&
      typeof options.verificationMethod !== "object"
    ) {
      throw TypeError(`"verificationMethod" must be object`);
    }


    let date: string | number | undefined = options.date
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


    proof = await options.purpose.update(proof, {
      document: options.document,
      suite: this,
      documentLoader: options.documentLoader,
      expansionMap: options.expansionMap,
    });
    proof.verificationMethod = options.verificationMethod?.id 
    proof.blockchainAccountId=options.verificationMethod?.blockchainAccountId
    proof.controller = options.verificationMethod?.controller
    proof.publickeyMultibase=options.verificationMethod?.publickeyMultibase


    const toBeSignedDocument = {
      message: options.document,
    };

    const canonizeDocument = await this.createVerifyData({
      document: toBeSignedDocument.message,
      documentLoader: options.documentLoader
        ? options.documentLoader
        : docloader,
    });

    console.log("Get Signature");
    
    const signature = await this.sign({
      message: canonizeDocument,
      proof,
    });
    proof[this.proofSignatureKey] = signature.signature;
    return proof;
  }
  async verifySignature(data: { message: any; signature: string }) {
    const { bech32Address, pubKey, algo } = await this.cosmosProvider.getKey(
      this.chainId
    );
    const signData = Buffer.from(data.message);
    const verified = await verifyADR36Amino(
      this.bech32AddressPrefix,
      bech32Address,
      signData,
      pubKey,
      new Uint8Array(Buffer.from(data.signature, "base64"))
    );
    return verified;
  }

  async verifyProof(options: {
    document: any;
    proof: any;
    documentLoader?: any;
  }) {
    const canonizeDocument = await this.createVerifyData({
      document: options.document,
      documentLoader: options.documentLoader
        ? options.documentLoader
        : docloader,
    });

    const signature = options.proof[this.proofSignatureKey];
    const { verificationMethod  } = options.proof;
    const verified = await this.verifySignature({
      message: canonizeDocument,
      signature,
    });


    return {
      verified,
      verificationMethod:{
        id: verificationMethod,
        controller:options.proof.controller,
        publickeyMultibase:options.proof.publickeyMultibase,
        type:options.proof.type
      }
    }
  }
}