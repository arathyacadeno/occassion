const path = require("path");
require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

const jiti = require("jiti")(process.cwd(), {
  alias: {
    "@": path.resolve(process.cwd(), "src"),
  },
});

const { signUserToken } = jiti(path.resolve(process.cwd(), "src/lib/auth/jwt.ts"));
const sql = neon(process.env.DATABASE_URL);

async function queryNeon(fn, retries = 4, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`[Neon Retry] Attempt ${i + 1} (${err.message}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function loadModule(relPath) {
  const fullPath = path.resolve(process.cwd(), relPath);
  return jiti(fullPath);
}

function createTestToken(user) {
  return signUserToken({
    userId: user.id || user.userId,
    email: user.email,
    name: user.name,
    role: user.role || "customer",
  });
}

function createRequest(url, { method = "GET", body = null, token = null, headers = {} } = {}) {
  const reqHeaders = new Headers(headers);
  if (body && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
    reqHeaders.set("Cookie", `occasions_token=${token}`);
  }

  const init = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  return new Request(url, init);
}

module.exports = {
  sql,
  queryNeon,
  loadModule,
  createTestToken,
  createRequest,
};
