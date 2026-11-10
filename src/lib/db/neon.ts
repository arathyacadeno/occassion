import { neon } from "@neondatabase/serverless";

// Ensure resilient DNS resolution for Neon Cloud endpoints in local and serverless environments
if (typeof window === "undefined") {
  try {
    const { setGlobalDispatcher, Agent } = require("undici");
    const dns = require("dns");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const dnsPromises = dns.promises;
    const agent = new Agent({
      connect: {
        lookup: (hostname: string, options: any, callback: any) => {
          dnsPromises
            .resolve4(hostname)
            .then((addresses: string[]) => {
              if (options && options.all) {
                callback(null, addresses.map((a: string) => ({ address: a, family: 4 })));
              } else {
                callback(null, addresses[0], 4);
              }
            })
            .catch(() => {
              // Fallback to OS resolver
              dns.lookup(hostname, options, callback);
            });
        },
      },
    });
    setGlobalDispatcher(agent);
  } catch {
    // Non-blocking in environments where custom dispatcher is not required
  }
}

if (!process.env.DATABASE_URL) {
  try {
    require("dotenv").config({ path: ".env.local" });
  } catch {
    // ignore
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not set in environment variables");
}

export const sql = neon(databaseUrl || "");

export default sql;
