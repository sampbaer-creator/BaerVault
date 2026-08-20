import "server-only";

import { createHash, createPublicKey, verify } from "node:crypto";

export type TellerEnrollmentResult = {
  accessToken: string;
  user: { id: string };
  enrollment: { id: string; institution: { name: string } };
  signatures: string[];
};

export function verifyTellerEnrollment(input: TellerEnrollmentResult, nonce: string, environment: string) {
  const signingKey = process.env.TELLER_TOKEN_SIGNING_PUBLIC_KEY;
  if (!signingKey) throw new Error("TELLER_TOKEN_SIGNING_PUBLIC_KEY is not configured.");
  if (!input.accessToken || !input.user?.id || !input.enrollment?.id || !input.signatures?.length) return false;
  const message = [nonce, input.accessToken, input.user.id, input.enrollment.id, environment].join(".");
  const normalizedKey = signingKey.replace(/\\n/g, "\n").trim();
  const key = normalizedKey.includes("BEGIN PUBLIC KEY")
    ? createPublicKey(normalizedKey)
    : createPublicKey({ key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(normalizedKey, /^[0-9a-f]{64}$/i.test(normalizedKey) ? "hex" : "base64")]), format: "der", type: "spki" });
  return input.signatures.some((signature) => {
    const signatureBytes = Buffer.from(signature, /^[0-9a-f]{128}$/i.test(signature) ? "hex" : "base64");
    try {
      return verify(null, createHash("sha256").update(message, "utf8").digest(), key, signatureBytes)
        || verify(null, Buffer.from(message), key, signatureBytes);
    }
    catch { return false; }
  });
}
