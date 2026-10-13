import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function worker(networkFails = false) {
  const events = new Map<string, (event: unknown) => void>();
  const cached: string[] = [];
  let updates = 0;
  const offline = new Response("Offline");
  vm.runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL, Response,
    self: {
      location: { origin: "https://baervault.test" },
      addEventListener: (name: string, handler: (event: unknown) => void) => events.set(name, handler),
      skipWaiting: () => { updates++; },
      clients: { claim: async () => undefined },
    },
    caches: {
      open: async () => ({ addAll: async (urls: string[]) => { cached.push(...urls); }, put: async (request: Request) => { cached.push(request.url); } }),
      match: async (url: string) => url === "/offline.html" ? offline : undefined,
      keys: async () => [],
    },
    fetch: async () => { if (networkFails) throw new Error("Offline"); return new Response("Network"); },
  });
  return { events, cached, updates: () => updates };
}

test("the install precache contains only public offline assets", async () => {
  const runtime = worker();
  let completion: Promise<unknown> | undefined;
  runtime.events.get("install")!({ waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
  await completion;
  assert.deepEqual(runtime.cached, ["/offline.html", "/icon.png", "/icon-192.png", "/apple-icon.png"]);
  assert.equal(runtime.updates(), 0);
});

test("worker activation requires an explicit update message", () => {
  const runtime = worker();
  runtime.events.get("message")!({ data: { type: "OTHER" } });
  assert.equal(runtime.updates(), 0);
  runtime.events.get("message")!({ data: { type: "SKIP_WAITING" } });
  assert.equal(runtime.updates(), 1);
});

test("API calls and server actions bypass the offline cache", () => {
  const runtime = worker();
  for (const request of [
    { method: "GET", url: "https://baervault.test/api/mobile-shell", mode: "cors" },
    { method: "POST", url: "https://baervault.test/budget", mode: "cors" },
    { method: "GET", url: "https://another.test/image.png", mode: "cors" },
  ]) {
    let intercepted = false;
    runtime.events.get("fetch")!({ request, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false);
  }
  assert.equal(runtime.cached.length, 0);
});

test("online financial pages are fetched without being cached", async () => {
  const runtime = worker();
  let response: Promise<Response> | undefined;
  runtime.events.get("fetch")!({ request: { method: "GET", url: "https://baervault.test/accounts", mode: "navigate" }, respondWith: (promise: Promise<Response>) => { response = promise; } });
  assert.equal(await (await response!).text(), "Network");
  assert.equal(runtime.cached.length, 0);
});

test("an offline navigation serves the public recovery page", async () => {
  const runtime = worker(true);
  let response: Promise<Response> | undefined;
  runtime.events.get("fetch")!({ request: { method: "GET", url: "https://baervault.test/accounts", mode: "navigate" }, respondWith: (promise: Promise<Response>) => { response = promise; } });
  assert.equal(await (await response!).text(), "Offline");
  assert.equal(runtime.cached.length, 0);
});
