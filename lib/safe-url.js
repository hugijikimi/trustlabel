import { lookup } from "node:dns/promises";

/**
 * The guard in front of the install checker.
 *
 * This endpoint fetches a URL a stranger typed, from inside our network. Without
 * these checks it is an open proxy: paste http://169.254.169.254/ and it reads
 * the cloud metadata service for you.
 *
 * Two layers, because either alone is bypassable. Hostname checks alone lose to
 * a public DNS name that resolves to 127.0.0.1; resolution checks alone lose to
 * a literal that never hits DNS.
 */

/** Expands any IPv6 spelling to eight 16-bit groups, or null if it is not one. */
function expandIpv6(address) {
  let text = address;

  // A trailing dotted quad (::ffff:127.0.0.1) becomes two hex groups first.
  const embedded = /^(.*?):(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(text);
  if (embedded) {
    const parts = embedded[2].split(".").map(Number);
    if (parts.some((part) => part > 255)) return null;
    const hi = ((parts[0] << 8) | parts[1]).toString(16);
    const lo = ((parts[2] << 8) | parts[3]).toString(16);
    text = `${embedded[1]}:${hi}:${lo}`;
  }

  const halves = text.split("::");
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":").filter(Boolean) : [];

  let groups;
  if (halves.length === 1) {
    if (head.length !== 8) return null;
    groups = head;
  } else {
    const fill = 8 - head.length - tail.length;
    if (fill < 0) return null;
    groups = [...head, ...Array(fill).fill("0"), ...tail];
  }

  const numbers = groups.map((group) => parseInt(group, 16));
  if (numbers.some((n) => Number.isNaN(n) || n < 0 || n > 0xffff)) return null;
  return numbers;
}

export function isBlockedIp(host) {
  const address = host.replace(/^\[|\]$/g, "").toLowerCase();

  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (v4) {
    const parts = v4.slice(1).map(Number);
    // Not a real address at all — refuse rather than hand it to the resolver.
    if (parts.some((part) => part > 255)) return true;
    const [a, b] = parts;
    if (a === 0) return true; // this network
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier NAT
    if (a >= 224) return true; // multicast and reserved
    return false;
  }

  if (address.includes(":")) {
    const groups = expandIpv6(address);
    // Unparseable is refused rather than handed to the resolver.
    if (!groups) return true;

    if (groups.every((g) => g === 0)) return true; // ::
    if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return true; // ::1
    if ((groups[0] & 0xfe00) === 0xfc00) return true; // unique local fc00::/7
    if ((groups[0] & 0xffc0) === 0xfe80) return true; // link-local fe80::/10

    // ::ffff:a.b.c.d and ::a.b.c.d, in either spelling — judge the v4 inside.
    if (groups.slice(0, 5).every((g) => g === 0) && (groups[5] === 0xffff || groups[5] === 0)) {
      const embedded = `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`;
      return isBlockedIp(embedded);
    }

    return false;
  }

  return false;
}

/** Parses and screens a URL without touching the network. */
export function parseTarget(raw) {
  let url;
  try {
    url = new URL(String(raw ?? "").trim());
  } catch {
    return { error: "invalid" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "protocol" };
  }

  const host = url.hostname.toLowerCase();
  if (host === "" || host === "localhost" || host.endsWith(".localhost")) {
    return { error: "private" };
  }
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".home.arpa")) {
    return { error: "private" };
  }
  if (isBlockedIp(host)) return { error: "private" };

  return { url };
}

/** Second layer: whatever the name resolves to must also be public. */
export async function resolvesPublicly(hostname) {
  let addresses;
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    return { error: "dns" };
  }
  if (addresses.length === 0) return { error: "dns" };
  if (addresses.some((entry) => isBlockedIp(entry.address))) return { error: "private" };
  return { ok: true };
}
