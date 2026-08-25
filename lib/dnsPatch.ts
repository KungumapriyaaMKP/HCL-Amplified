import dns from "node:dns";

/**
 * `dns.setServers()` only affects `dns.resolve*()` - it has NO effect on
 * `dns.lookup()`, which always defers to the OS's own resolver. On this
 * network, the OS resolver intermittently fails (ENOTFOUND) to resolve
 * Supabase's direct DB host (AAAA-only record), while `dns.resolve6()`
 * against a public resolver (8.8.8.8/1.1.1.1) succeeds every time.
 *
 * `net.connect()` (and therefore `postgres.js`) calls `dns.lookup()`
 * internally with no way to swap in `resolve6`, so the only fix is to
 * patch `dns.lookup` itself - but only for this one specific hostname, so
 * every other lookup in the process (OpenRouter, Supabase Auth, Microsoft
 * Learn, ...) keeps using the normal OS resolver unchanged.
 */
export function patchDnsLookupFor(hostname: string) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  const originalLookup = dns.lookup;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dns as any).lookup = function patchedLookup(host: string, ...rest: any[]) {
    if (host !== hostname) {
      // @ts-expect-error - variadic passthrough to the original overload set
      return originalLookup.call(dns, host, ...rest);
    }

    const callback = rest[rest.length - 1] as (err: NodeJS.ErrnoException | null, address: string, family: number) => void;
    const wantsAll = typeof rest[0] === "object" && rest[0]?.all;

    (async () => {
      try {
        const v4 = await dns.promises.resolve4(host).catch(() => []);
        if (v4.length) {
          return callback(null, wantsAll ? (v4.map((a) => ({ address: a, family: 4 })) as never) : v4[0], 4);
        }
        const v6 = await dns.promises.resolve6(host);
        return callback(null, wantsAll ? (v6.map((a) => ({ address: a, family: 6 })) as never) : v6[0], 6);
      } catch {
        // last resort: give the OS resolver a chance too
        // @ts-expect-error - variadic passthrough to the original overload set
        originalLookup.call(dns, host, ...rest);
      }
    })();
  };
}
