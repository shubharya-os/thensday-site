// node tools/check_plan_fixture.mjs ../app/docs/plan_link_fixture.txt  (run from site/)
// Decodes line 1 of the fixture with the exact module the plan page uses and compares it to line 2.
import { readFileSync } from 'node:fs';
import { decodePlanHash, decodePayloadToJSONText, PlanLinkError } from '../p/plan.js';
import assert from 'node:assert/strict';

const [url, expected] = readFileSync(process.argv[2], 'utf8').split('\n');
const hash = new URL(url).hash;
const text = await decodePayloadToJSONText(hash.slice('#v1.'.length));
assert.equal(text, expected.trim(), 'decoded JSON text differs from the fixture');
const plan = await decodePlanHash(hash);
assert.deepEqual(plan, JSON.parse(expected), 'normalized plan differs from the fixture');
console.log('fixture OK:', plan.t, '·', plan.w, '·', plan.i.length, 'items');

// Bad inputs fail with PlanLinkError, never anything else.
for (const bad of ['', '#', '#v2.abc', '#hello', '#v1.', '#v1.!!!!', '#v1.AAAA', '#v1.' + 'A'.repeat(9000), '#v1.' + hash.slice(4, 30)]) {
  await assert.rejects(decodePlanHash(bad), PlanLinkError, 'should reject ' + bad.slice(0, 20));
}
// Valid deflate but not an object / wrong field types -> normalized safely.
const { deflateRawSync } = await import('node:zlib');
const enc = (o) => '#v1.' + deflateRawSync(Buffer.from(JSON.stringify(o))).toString('base64url');
await assert.rejects(decodePlanHash(enc([1, 2])), PlanLinkError);
const weird = await decodePlanHash(enc({ t: 5, i: [{ t: '<img src=x onerror=alert(1)>', y: 'hack', u: 'javascript:alert(1)' }, null, 'x'] }));
assert.deepEqual(weird, { t: '', w: '', i: [{ t: '<img src=x onerror=alert(1)>', y: '', p: '', u: 'javascript:alert(1)', n: '' }] });
console.log('bad-input cases OK');
