/* global console */
import { migrationClient } from "./lib/config.mjs";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const client = migrationClient();
const homepage = await client.fetch(
  `*[_id == "homepage"][0]{
    _id,
    _rev,
    "section": sections[0]{_key, internalName}
  }`,
);

if (
  homepage?._id !== "homepage" ||
  !homepage.section?._key ||
  !homepage.section?.internalName
) {
  throw new Error(
    "The published homepage does not have a safe internal section label for webhook testing.",
  );
}

const path = `sections[_key=="${homepage.section._key}"].internalName`;
const result = await client
  .patch(homepage._id)
  .ifRevisionId(homepage._rev)
  .set({ [path]: homepage.section.internalName })
  .commit({ returnDocuments: false });

console.log(
  JSON.stringify({
    documentId: homepage._id,
    operation: "no-op internal label update",
    transactionId: result.transactionId,
    testedAt: new Date().toISOString(),
  }),
);
