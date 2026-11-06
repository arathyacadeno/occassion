/**
 * Occasions E-Commerce Platform - Master Test Suite Runner
 * Runs all 6 E2E Test Suites sequentially against Neon PostgreSQL Single Source of Truth
 */

const { execSync } = require("child_process");

const suites = [
  { name: "Section 1: Authentication Testing", file: "tests/e2e/test-auth.js" },
  { name: "Section 2: Customer Account Testing", file: "tests/e2e/test-customer-accounts.js" },
  { name: "Section 3: E-Commerce Testing", file: "tests/e2e/test-ecommerce.js" },
  { name: "Section 4: Order & Payment Testing", file: "tests/e2e/test-orders-payments.js" },
  { name: "Section 5: Admin Testing", file: "tests/e2e/test-admin.js" },
  { name: "Section 6: Database & Integrity Testing", file: "tests/e2e/test-database-integrity.js" },
];

console.log("========================================================================");
console.log("   OCCASIONS PLATFORM - END-TO-END VERIFICATION AUDIT RUNNER             ");
console.log("   Database: Neon PostgreSQL Serverless (Single Source of Truth)        ");
console.log("========================================================================\n");

let totalPassed = 0;
let totalFailed = 0;
const suiteResults = [];

for (const suite of suites) {
  console.log(`Starting ${suite.name}...`);
  const startTime = Date.now();
  try {
    const output = execSync(`node ${suite.file}`, { encoding: "utf8" });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Parse pass/fail count
    const match = output.match(/Results:\s*(\d+)\s*Passed,\s*(\d+)\s*Failed/i);
    const passed = match ? parseInt(match[1], 10) : 0;
    const failed = match ? parseInt(match[2], 10) : 0;
    
    totalPassed += passed;
    totalFailed += failed;
    suiteResults.push({ name: suite.name, passed, failed, duration: `${duration}s`, status: failed === 0 ? "PASSED" : "FAILED" });
    console.log(`✓ ${suite.name} finished in ${duration}s (${passed} passed, ${failed} failed)\n`);
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`✗ ${suite.name} failed execution:`, err.stdout || err.message);
    suiteResults.push({ name: suite.name, passed: 0, failed: 1, duration: `${duration}s`, status: "ERROR" });
    totalFailed += 1;
  }
}

console.log("========================================================================");
console.log("   MASTER AUDIT SUMMARY REPORT                                          ");
console.log("========================================================================");
console.table(suiteResults);
console.log(`\nTOTAL VERIFIED TESTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log(`OVERALL STATUS: ${totalFailed === 0 ? "ALL SYSTEMS OPERATIONAL (100% PASS)" : "FAILURES DETECTED"}\n`);

if (totalFailed > 0) process.exit(1);

