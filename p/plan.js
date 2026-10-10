// Thensday plan links: decode `#v1.<payload>`.
// payload = base64url (no padding) of raw DEFLATE (RFC 1951, no zlib header) of UTF-8 JSON:
//   {"t": title, "w": whenLabel, "i": [{"t","y","p","u","n"}]}
// The same module runs in the browser (p/index.html) and in Node (scripts check), so the
// check proves the code the page actually uses.

export const TYPES = ['do', 'buy', 'go', 'cook', 'reachOut', ''];
const MAX_ITEMS = 30;
const MAX_LEN = 500;          // the app caps strings at 140; allow headroom, never unbounded
const MAX_PAYLOAD = 8000;     // the app caps whole URLs at 4,000 chars
const MAX_JSON_BYTES = 200000;

export class PlanLinkError extends Error {}

export function base64urlToBytes(s) {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new PlanLinkError('bad characters');
  if (s.length % 4 === 1) throw new PlanLinkError('bad length');
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  let bin;
  try { bin = atob(b64); } catch { throw new PlanLinkError('bad base64'); }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new PlanLinkError('unsupported browser');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = stream.getReader();
  const chunks = []; let total = 0;
  for (;;) {
    let r;
    try { r = await reader.read(); } catch { throw new PlanLinkError('bad deflate'); }
    const { value, done } = r;
    if (done) break;
    total += value.length;
    if (total > MAX_JSON_BYTES) { reader.cancel(); throw new PlanLinkError('too large'); }
    chunks.push(value);
  }
  const all = new Uint8Array(total); let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  return all;
}

const str = (v) => (typeof v === 'string' ? v.slice(0, MAX_LEN) : '');

/** Coerce decoded JSON into the plan shape; unknown fields are dropped. */
export function normalizePlan(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new PlanLinkError('not an object');
  const items = Array.isArray(obj.i) ? obj.i : [];
  return {
    t: str(obj.t),
    w: str(obj.w),
    i: items.slice(0, MAX_ITEMS).filter((x) => x && typeof x === 'object').map((x) => ({
      t: str(x.t),
      y: TYPES.includes(x.y) ? x.y : '',
      p: str(x.p),
      u: str(x.u),
      n: str(x.n),
    })),
  };
}

/** Returns the JSON text exactly as encoded (for the fixture check) */
export async function decodePayloadToJSONText(payload) {
  if (payload.length > MAX_PAYLOAD) throw new PlanLinkError('too long');
  const bytes = await inflateRaw(base64urlToBytes(payload));
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new PlanLinkError('not utf-8'); }
}

/** hash: location.hash, e.g. "#v1.XY1B..." (leading '#' optional). */
export async function decodePlanHash(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (!h) throw new PlanLinkError('missing');
  const m = /^v1\.(.+)$/.exec(h);
  if (!m) throw new PlanLinkError(h.startsWith('v') ? 'unsupported version' : 'bad format');
  const text = await decodePayloadToJSONText(m[1]);
  let obj;
  try { obj = JSON.parse(text); } catch { throw new PlanLinkError('bad json'); }
  return normalizePlan(obj);
}

/** Only http(s) links are ever rendered as links. */
export function safeHttpURL(u) {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch { return null; }
}

export function mapsURL(place) {
  return 'https://maps.apple.com/?q=' + encodeURIComponent(place);
}
