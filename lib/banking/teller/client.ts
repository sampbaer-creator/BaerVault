import "server-only";

import { request as httpsRequest } from "node:https";

import { decryptBankToken } from "@/lib/banking/crypto";
import type { BankConnection } from "@/lib/banking/types";

function pem(name: "TELLER_CERTIFICATE" | "TELLER_PRIVATE_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value.replace(/\\n/g, "\n");
}

export async function tellerRequest<T>(connection: BankConnection, path: string, method = "GET"): Promise<T> {
  const token = decryptBankToken(connection.encryptedAccessToken);
  return new Promise((resolve, reject) => {
    const req = httpsRequest({
      protocol: "https:", hostname: "api.teller.io", port: 443, path, method,
      cert: pem("TELLER_CERTIFICATE"), key: pem("TELLER_PRIVATE_KEY"),
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString("base64")}`, "Teller-Version": "2020-10-12", Accept: "application/json" },
      timeout: 20_000,
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`Teller request failed (${res.statusCode ?? "unknown"}).`));
        if (res.statusCode === 204 || !body) return resolve(undefined as T);
        try { resolve(JSON.parse(body) as T); } catch { reject(new Error("Teller returned an invalid response.")); }
      });
    });
    req.on("timeout", () => req.destroy(new Error("Teller request timed out.")));
    req.on("error", reject);
    req.end();
  });
}
