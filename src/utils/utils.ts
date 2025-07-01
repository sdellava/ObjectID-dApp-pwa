import { getFullnodeUrl, IotaClient, IotaObjectData } from "@iota/iota-sdk/client";
import { validateGeolocation } from "./ValidateGeolocation";

import {
  IotaDocument,
  IdentityClientReadOnly,
  IotaDID,
  DomainLinkageConfiguration,
  JwtDomainLinkageValidator,
  EdDSAJwsVerifier,
  JwtCredentialValidationOptions,
} from "@iota/identity-wasm/web";
import axios from "axios";
import { getObject } from "./getObject";

export type ValidationResult = {
  check: boolean[];
  checkMsg: string[];
  checked: boolean;
};

type ObjectInfoResult = {
  objectData: {
    fields: Record<string, any>;
    type: string;
    id: string;
    network: string;
  };
  objectType: string;
  objectPackageId: string;
  eventType: string;
  objectPackageName: string;
};

const debug = false;

export async function getObjectInfo(
  oid: string,
  client: IotaClient,
  network: string
): Promise<ObjectInfoResult | null> {
  try {
    const object = (await getObject(client, oid)) as {
      type: string;
      content: { fields: any };
    };

    if (debug) console.log("object", object);

    if (!object?.content?.fields) {
      throw new Error("QRcode is invalid");
    }

    const objectType = object.type as string;
    const objectPackageId = objectType.split("::")[0];
    const objectPackageName = `${objectPackageId}::oid_object`;
    const eventType = `${objectPackageId}::oid_object::OIDEvent`;

    const owner = object.content.fields.owner_did?.trim();
    const agent = object.content.fields.agent_did?.trim();

    return {
      objectData: {
        fields: object.content.fields,
        type: objectType,
        id: oid,
        network,
      },
      objectType,
      objectPackageId,
      eventType,
      objectPackageName,
    };
  } catch (err) {
    console.error("Error retrieving object:", err);
    return null;
  }
}

export function getOIDFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("oid");
}

export const validateObject = async (
  objectData: any,
  officialPackages: string[],
  client: IotaClient,
  network: string
): Promise<ValidationResult> => {
  const { creator_did, owner_did, agent_did } = objectData.fields;

  let c: ValidationResult = {
    check: [],
    checkMsg: [],
    checked: false,
  };

  // SmartContract Validation
  const objectPackage = objectData.type.split("::")[0];
  const check = officialPackages.includes(objectPackage);

  if (debug) console.log("SC validation");

  if (check) {
    c.check.push(true);
    c.checkMsg.push("ObjectID has been created by an official smart contract.");
    if (debug) console.log("OK!");
  } else {
    c.check.push(false);
    c.checkMsg.push("ObjectID has been created by an unofficial smart contract.");
    if (debug) console.log("NOK!");
  }

  // producer DID validation
  if (debug) console.log("Producer DID");

  try {
    const creatorIdFragment = creator_did.split(":").pop();

    if (debug) console.log("creatorIdFragment", creatorIdFragment);

    const response = await validateDid(network, creatorIdFragment);
    const check = response.success;
    c.check.push(check);
    if (check) {
      c.checkMsg.push("Producer DID is valid.");
      if (debug) console.log("OK!");
    } else {
      c.checkMsg.push("Producer DID is invalid.");
    }
  } catch (error) {
    c.check.push(false);
    c.checkMsg.push("Producer DID is invalid.");
    if (debug) console.log("NOK!");
  }

  // producer DLVC validation
  if (debug) console.log("Producer DLVC");

  try {
    const creatorIdFragment = creator_did.split(":").pop();

    if (debug) console.log("creatorIdFragment", creatorIdFragment);

    const didDocument = await resolveDID(creatorIdFragment, client, network);

    let dlvcTest;

    if (didDocument) dlvcTest = await validate_dlvc(didDocument, creator_did);

    if (dlvcTest) {
      c.check.push(true);
      c.checkMsg.push("The product Internet Domain is linked with the producer DID (DLVC is valid).");
      if (debug) console.log("OK!");
    } else {
      c.check.push(false);
      c.checkMsg.push("The product Internet Domain is linked with the producer DID (DLVC is invalid).");
      if (debug) console.log("NOK!");
    }
  } catch (error) {
    c.check.push(false);
    c.checkMsg.push("The product Internet Domain is linked with the producer DID (DLVC is invalid).");
    if (debug) console.log("NOK!");
  }

  // Owner DID validation
  if (debug) console.log("Owner DID");
  try {
    const creatorIdFragment = owner_did.split(":").pop();

    if (debug) console.log("creatorIdFragment", creatorIdFragment);

    const response = await validateDid(network, creatorIdFragment);
    const check = response.success;
    c.check.push(check);
    if (check) {
      c.checkMsg.push("Owner DID is valid.");
      if (debug) console.log("OK!");
    } else {
      c.checkMsg.push("Owner DID is invalid.");
      if (debug) console.log("NOK!");
    }
  } catch (error) {
    c.check.push(false);
    c.checkMsg.push("Owner DID is invalid.");
  }

  // Agent DID validation
  if (debug) console.log("Agent DID");

  if (agent_did === undefined) {
    try {
      const creatorIdFragment = agent_did.split(":").pop();
      const response = await validateDid(network, creatorIdFragment);
      const check = response.success;
      c.check.push(check);
      if (check) {
        c.checkMsg.push("Agent DID is valid.");
        if (debug) console.log("OK!");
      } else {
        c.checkMsg.push("Agent DID is invalid.");
        if (debug) console.log("NOK!");
      }
    } catch (error) {
      c.check.push(false);
      c.checkMsg.push("Agent DID is invalid.");
    }
  }

  // Geolocation validation
  if (debug) console.log("Geolocation");

  try {
    const geo_location = objectData.fields.geo_location;

    if (geo_location) {
      const geoValidation = await validateGeolocation(geo_location);
      const check = geoValidation.check[0] === true;
      c.check.push(check);
      c.checkMsg.push(geoValidation.checkMsg[0]);

      if (debug) {
        console.log(check ? "OK!" : "NOK!");
      }
    } else {
      c.check.push(false);
      c.checkMsg.push("No geolocation data available.");
      if (debug) console.log("No geolocation in object.");
    }
  } catch (error) {
    c.check.push(false);
    c.checkMsg.push("Geolocation validation failed.");
    if (debug) console.log("NOK!", error);
  }

  c.checked = true;

  if (debug) console.log("Validation Result:", c);

  return c;
};

export async function validateDid(network: string, didObject: any) {
  const client = new IotaClient({ url: getFullnodeUrl(network) });

  if (debug) console.log("---validate---");
  if (debug) console.log("didObject", didObject);

  try {
    const identityClientReadOnly = await IdentityClientReadOnly.create(client);

    const iotaDid = IotaDID.fromAliasId(didObject, network);

    const didDocument: IotaDocument = await identityClientReadOnly.resolveDid(iotaDid);

    return {
      success: true,
      message: "DID resolved",
      didDocument,
    };
  } catch (error) {
    if (debug) console.log(error);
    return {
      success: false,
      message: "DID not resolved",
      didDocument: "",
    };
  }
}

export async function validate_dlvc(didDocument: IotaDocument, did: string) {
  const methods = didDocument.methods();
  for (const method of methods) {
    const DIDcontroller = method.controller().toUrl().toString();

    if (DIDcontroller === did) {
      const serviceList = didDocument.service();
      for (const service of serviceList) {
        if (service.type().includes("LinkedDomains")) {
          const SE_DID_linked_URL = service.serviceEndpoint();

          let DID_linked_domain = "";

          if (typeof SE_DID_linked_URL === "string") {
            const url = new URL(SE_DID_linked_URL);
            DID_linked_domain = url.hostname;
          } else if (Array.isArray(SE_DID_linked_URL)) {
            // Prendi il primo elemento dell'array, se esiste
            const url = new URL(SE_DID_linked_URL[0]);
            DID_linked_domain = url.hostname;
          } else if (SE_DID_linked_URL instanceof Map) {
            // Recupera il primo valore della mappa
            const first = SE_DID_linked_URL.values().next().value;
            if (Array.isArray(first) && first.length > 0) {
              const url = new URL(first[0]);
              DID_linked_domain = url.hostname;
            }
          }

          DID_linked_domain = "https://" + DID_linked_domain.replace(/^www\./, "") + "/";
          const DID_linked_URL = service.serviceEndpoint().toString();

          const configUrl = `${DID_linked_domain}.well-known/did-configuration.json?ts=${Date.now()}`;
          const response = await axios.get(configUrl);

          if (response?.data?.linked_dids || Array.isArray(response.data.linked_dids)) {
            const [jwt] = response.data.linked_dids;

            if (!(typeof jwt !== "string" || jwt.split(".").length !== 3)) {
              const fetchedConfigurationResource = DomainLinkageConfiguration.fromJSON(response.data);

              try {
                new JwtDomainLinkageValidator(new EdDSAJwsVerifier()).validateLinkage(
                  didDocument,
                  fetchedConfigurationResource,
                  DID_linked_URL,
                  new JwtCredentialValidationOptions()
                );

                return true;
              } catch (error: unknown) {
                if (debug) console.log(error);
                return false;
              }
            }
          } else {
            return false;
          }
        }
      }
    }
  }
}

export async function resolveDID(didDocObj: string, client: IotaClient, network: string) {
  try {
    let localNetwork = network;
    if (network === "mainnet") localNetwork = "iota";

    const identityClientReadOnly = await IdentityClientReadOnly.create(client);
    const iotaDid = IotaDID.fromAliasId(didDocObj, localNetwork);

    return await identityClientReadOnly.resolveDid(iotaDid);
  } catch (error) {
    if (debug) console.log(error);
  }
}
