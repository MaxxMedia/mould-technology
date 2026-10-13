const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../lib/razorpay.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const payment = { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "test_signature" };

function checkout({ verifyResponse, verifyError, cachedUser = JSON.stringify({ packageSelected: false }), storageError = false } = {}) {
  let options;
  const errors = [];
  const events = [];
  const requests = [];
  const cache = new Map([["token", "test_token"], ["user", cachedUser]]);
  const window = {
    location: { href: "" },
    dispatchEvent(event) { events.push(event.type); },
    Razorpay: class {
      constructor(value) { options = value; }
      open() {}
      on() {}
    },
  };
  const context = {
    exports: {}, window, Event,
    localStorage: {
      getItem(key) { return cache.get(key) ?? null; },
      setItem(key, value) { if (storageError) throw new Error("Storage disabled"); cache.set(key, value); },
    },
    process: { env: { NEXT_PUBLIC_API_URL: "http://api.test" } },
    fetch: async (url, init) => {
      requests.push({ url, init });
      if (url.endsWith("create-order")) return { ok: true, json: async () => ({ keyId: "test_key", orderId: "order_test", amount: 100, currency: "INR", packageName: "Basic" }) };
      if (verifyError) throw verifyError;
      return verifyResponse ?? { ok: true, json: async () => ({ success: true }) };
    },
  };
  vm.runInNewContext(compiled, context);
  return {
    cache, window, errors, events, requests,
    options: () => options,
    start: (onSuccess) => context.exports.startPackagePayment({ packageType: "SUBSCRIPTION", packageId: "basic", onSuccess, onError: (message) => errors.push(message) }),
  };
}

test("successful verification waits for user refresh and lets the callback navigate", async () => {
  const flow = checkout();
  let releaseRefresh;
  let refreshed = false;
  const refresh = new Promise((resolve) => { releaseRefresh = resolve; });
  await flow.start(async () => { await refresh; refreshed = true; flow.window.location.href = "/custom-success"; });
  const completion = flow.options().handler(payment);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(refreshed, false);
  assert.equal(flow.window.location.href, "");
  releaseRefresh();
  await completion;
  assert.equal(refreshed, true);
  assert.equal(flow.window.location.href, "/custom-success");
  assert.equal(JSON.parse(flow.cache.get("user")).packageSelected, true);
  assert.deepEqual(flow.events, ["userChanged"]);
  assert.deepEqual(flow.errors, []);
  assert.equal(flow.requests[1].init.headers.Authorization, "Bearer test_token");
  assert.deepEqual(JSON.parse(flow.requests[1].init.body), payment);
});

test("backend verification error is shown without a success callback or redirect", async () => {
  const flow = checkout({ verifyResponse: { ok: false, json: async () => ({ error: "Payment verification failed" }) } });
  let success = false;
  await flow.start(() => { success = true; });
  await flow.options().handler(payment);
  assert.deepEqual(flow.errors, ["Payment verification failed"]);
  assert.equal(success, false);
  assert.equal(flow.window.location.href, "");
  assert.equal(JSON.parse(flow.cache.get("user")).packageSelected, false);
});

test("network loss after checkout gives a confirmation message without an unhandled rejection", async () => {
  const flow = checkout({ verifyError: new Error("Network unavailable") });
  await flow.start();
  await assert.doesNotReject(flow.options().handler(payment));
  assert.equal(flow.errors.length, 1);
  assert.match(flow.errors[0], /confirmation could not be retrieved/);
  assert.equal(flow.window.location.href, "");
});

test("non-JSON verification response is handled as unavailable confirmation", async () => {
  const flow = checkout({ verifyResponse: { ok: false, json: async () => { throw new Error("Invalid JSON"); } } });
  await flow.start();
  await assert.doesNotReject(flow.options().handler(payment));
  assert.match(flow.errors[0], /confirmation could not be retrieved/);
});

for (const config of [{ cachedUser: "invalid JSON" }, { storageError: true }]) {
  test("browser cache error cannot turn verified payment into a failure: " + JSON.stringify(config), async () => {
    const flow = checkout(config);
    let success = false;
    await flow.start(() => { success = true; });
    await flow.options().handler(payment);
    assert.equal(success, true);
    assert.deepEqual(flow.errors, []);
  });
}

test("checkout dismissal after submitting payment cannot report cancellation", async () => {
  const flow = checkout();
  await flow.start();
  const completion = flow.options().handler(payment);
  flow.options().modal.ondismiss();
  await completion;
  assert.deepEqual(flow.errors, []);
  assert.equal(flow.window.location.href, "/recruiter/onboarding");
});

test("checkout dismissal before payment reports cancellation", async () => {
  const flow = checkout();
  await flow.start();
  flow.options().modal.ondismiss();
  assert.deepEqual(flow.errors, ["Payment cancelled"]);
});

test("verification requires an explicit success response", async () => {
  const flow = checkout({ verifyResponse: { ok: true, json: async () => ({ success: false }) } });
  await flow.start();
  await flow.options().handler(payment);
  assert.deepEqual(flow.errors, ["Payment verification failed"]);
  assert.equal(flow.window.location.href, "");
});

test("failed success callback falls back to onboarding without reporting payment failure", async () => {
  const flow = checkout();
  await flow.start(async () => { throw new Error("Refresh failed"); });
  await flow.options().handler(payment);
  assert.equal(flow.window.location.href, "/recruiter/onboarding");
  assert.deepEqual(flow.errors, []);
});
