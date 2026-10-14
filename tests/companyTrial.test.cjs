const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");
const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../lib/companyTrial.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function browser({ token = "test-token", cachedUser = null, status = 200, body = { success: true, trial: { status: "ACTIVE", days: 30 } } } = {}) {
  const calls = [];
  const storage = new Map([["token", token], ["user", cachedUser]]);
  const context = { exports: {}, process: { env: { NEXT_PUBLIC_API_URL: "https://api.test" } }, localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }, Event: class {}, window: { location: { href: "" }, dispatchEvent() {} }, fetch: async (url, options) => { calls.push({ url, options }); return { ok: status < 400, json: async () => body }; } };
  vm.runInNewContext(source, context);
  return { ...context, calls, storage };
}
test("starting a trial sends the company package to the backend without loading Razorpay", async () => {
  const app = browser();
  const trial = await app.exports.startCompanyTrial("SUBSCRIPTION", "enterprise");
  assert.equal(trial.status, "ACTIVE");
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].url, "https://api.test/api/payments/start-trial");
  assert.equal(app.calls[0].options.headers.Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(app.calls[0].options.body), { packageType: "SUBSCRIPTION", packageId: "enterprise" });
});
test("used company trial shows the backend renewal message", async () => {
  const app = browser({ status: 409, body: { error: "Your company has already used its trial." } });
  await assert.rejects(app.exports.startCompanyTrial("BANNER", "homepage-hero:monthly"), /already used its trial/);
});
test("trial success requires an explicit success flag", async () => {
  const app = browser({ body: { trial: { status: "ACTIVE" } } });
  await assert.rejects(app.exports.startCompanyTrial("RECRUITMENT", "single-job"), /Unable to start/);
});
test("guests are sent to recruiter signup before attempting a trial", async () => {
  const app = browser({ token: null });
  assert.equal(await app.exports.startCompanyTrial("SPONSORED", "gold"), null);
  assert.equal(app.calls.length, 0);
  assert.equal(app.window.location.href, "/signup?role=recruiter&redirect=%2Fpackages");
});

test("server activation updates cached package selection before navigation", async () => {
  const app = browser({ cachedUser: JSON.stringify({ isOnboarded: true, packageSelected: false }) });
  await app.exports.startCompanyTrial("SUBSCRIPTION", "enterprise");
  assert.deepEqual(JSON.parse(app.storage.get("user")), { isOnboarded: true, packageSelected: true });
});
test("corrupted browser cache cannot report failure after a successful trial activation", async () => {
  const app = browser({ cachedUser: "invalid JSON" });
  assert.equal((await app.exports.startCompanyTrial("SUBSCRIPTION", "enterprise")).status, "ACTIVE");
});
