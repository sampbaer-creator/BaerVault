import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { decodeProtectedHeader, importJWK, jwtVerify, type JWK } from "jose";
import { plaidRequest } from "./client";

const keys = new Map<string, JWK>();

export async function verifyPlaidWebhook(rawBody: string, signedJwt: string | null) {
  if (!signedJwt) return false;
  try {
    const header = decodeProtectedHeader(signedJwt);
    if (header.alg !== "ES256" || !header.kid) return false;
    let key = keys.get(header.kid);
    if (!key) {
      const response = await plaidRequest<{ key: JWK }>("/webhook_verification_key/get", { key_id: header.kid });
      key = response.key;
      if (key.alg !== "ES256" || key.kid !== header.kid) return false;
      keys.set(header.kid, key);
    }
    const verified = await jwtVerify(signedJwt, await importJWK(key, "ES256"), { algorithms: ["ES256"], maxTokenAge: "5 min" });
    const claimed = verified.payload.request_body_sha256;
    if (typeof claimed !== "string" || !/^[0-9a-f]{64}$/.test(claimed)) return false;
    const actual = createHash("sha256").update(rawBody).digest("hex");
    return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(claimed, "hex"));
  } catch { return false; }
}
