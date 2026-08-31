import dns from "node:dns";

/**
 * Patches `dns.lookup` for the Supabase database hostname.
 * Resolves IPv4 addresses directly via Google/Cloudflare DNS (8.8.8.8/1.1.1.1)
 * to bypass intermittent OS resolver failures while ensuring IPv4-only network
 * compatibility (preventing EADDRNOTAVAIL on IPv6 unreachable routes).
 */
export function patchDnsLookupFor(hostname: string) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "1.0.0.1"]);
  } catch {
    // fallback if setServers fails
  }

  const originalLookup = dns.lookup;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dns as any).lookup = function patchedLookup(host: string, ...rest: any[]) {
    if (host !== hostname) {
      // @ts-expect-error - variadic passthrough to the original overload set
      return originalLookup.call(dns, host, ...rest);
    }

    const callback = rest[rest.length - 1] as (err: NodeJS.ErrnoException | null, address: string | any, family?: number) => void;
    const wantsAll = typeof rest[0] === "object" && rest[0]?.all;

    (async () => {
      try {
        // First try IPv4 lookup via Google/Cloudflare DNS
        let v4 = await dns.promises.resolve4(host).catch(() => []);
        
        // Retry once if first DNS query returned empty
        if (!v4.length) {
          v4 = await dns.promises.resolve4(host).catch(() => []);
        }

        if (v4.length) {
          if (wantsAll) {
            return callback(null, v4.map((a) => ({ address: a, family: 4 })) as never, 4);
          }
          return callback(null, v4[0], 4);
        }

        // Fallback to original OS lookup if IPv4 resolve was empty
        // @ts-expect-error - variadic passthrough to the original overload set
        return originalLookup.call(dns, host, ...rest);
      } catch {
        // @ts-expect-error - variadic passthrough to the original overload set
        return originalLookup.call(dns, host, ...rest);
      }
    })();
  };
}
