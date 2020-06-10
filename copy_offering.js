const {ElvClient} = require("elv-client-js");
const fs = require("fs");


const CopyOffering = async (mezLibId, mezObjectId, fromOfferingId, toOfferingId) => {

  const client = await ElvClient.FromConfigurationUrl({
    configUrl: process.env.FABRIC_CONFIG_URL
  });

  // client.ToggleLogging(true);

  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  await client.SetSigner({signer});

  console.log("Retrieving mezzanine metadata...");

  metadata = await client.ContentObjectMetadata({libraryId: mezLibId, objectId: mezObjectId});

  // read from metadata top level key 'offerings'
  if (!metadata.offerings) {
    console.log(`top level metadata key "offerings" not found`);
  }

  if (!metadata.offerings[fromOfferingId]) {
    console.log(`top level metadata key "offerings" does not contain a "` + fromOfferingId + `" offering`);
  }

  metadata.offerings[toOfferingId] = metadata.offerings[fromOfferingId];
  console.log("");
  console.log("Writing metadata back to object.");
  const {write_token} = await client.EditContentObject({
    libraryId: mezLibId,
    objectId: mezObjectId
  });
  response = await client.ReplaceMetadata({
    metadata: metadata,
    libraryId: mezLibId,
    objectId: mezObjectId,
    writeToken: write_token
  });
  response = await client.FinalizeContentObject({libraryId: mezLibId, objectId: mezObjectId, writeToken: write_token});

  console.log("");
  console.log("Done with CopyOffering call.");
  console.log("");
};

const mezLibId = process.argv[2];
const mezObjectId = process.argv[3];
const fromOfferingId = process.argv[4];
const toOfferingId = process.argv[5];

if (!mezLibId || !mezObjectId || !fromOfferingId || !toOfferingId) {
  console.error(`
Usage: node copy_offering.js mezLibId mezObjectId fromOfferingId toOfferingId
  
`);
  return;
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error(`
PRIVATE_KEY environment variable must be specified
`);
  return;
}

const configUrl = process.env.FABRIC_CONFIG_URL;
if (!configUrl) {
  console.error(`
FABRIC_CONFIG_URL environment variable must be specified, e.g. for test fabric, export FABRIC_CONFIG_URL=https://main.net955210.contentfabric.io/config
`);
  return;
}

CopyOffering(
  mezLibId,
  mezObjectId,
  fromOfferingId,
  toOfferingId
);
