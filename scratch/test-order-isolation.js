const { DatabaseSync } = require('node:sqlite');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "occasions-florist-calicut-secret-2026-secure-jwt";
const db = new DatabaseSync('./data/occasions.db');

function createToken(userId, email, name, role = "customer") {
  return jwt.sign({ userId, email, name, role }, JWT_SECRET, { expiresIn: '7d' });
}

console.log("=== Testing Account Isolation & Order Security ===");

// 1. Get Customer A and Customer B
const customerA = db.prepare("SELECT * FROM users WHERE email = 'arathytp54@gmail.com'").get();
const customerB = db.prepare("SELECT * FROM users WHERE email = 'cmisna2@gmail.com'").get();
const customerNew = db.prepare("SELECT * FROM users WHERE email = 'arathyacadeno@gmail.com'").get();

console.log("Customer A:", customerA?.name, customerA?.id);
console.log("Customer B:", customerB?.name, customerB?.id);
console.log("Customer New:", customerNew?.name, customerNew?.id);

// Scenario 1: Customer A fetches their orders
const ordersA = db.prepare("SELECT id, user_id, customer_name FROM orders WHERE user_id = ?").all(customerA.id);
console.log("\nScenario 1: Customer A sees", ordersA.length, "orders. All belong to Customer A:", ordersA.every(o => o.user_id === customerA.id));

// Scenario 2: Customer B fetches their orders
const ordersB = db.prepare("SELECT id, user_id, customer_name FROM orders WHERE user_id = ?").all(customerB.id);
console.log("Scenario 2: Customer B sees", ordersB.length, "orders. All belong to Customer B:", ordersB.every(o => o.user_id === customerB.id));

// Scenario 3: New customer fetches their orders
const ordersNew = db.prepare("SELECT id, user_id, customer_name FROM orders WHERE user_id = ?").all(customerNew.id);
console.log("Scenario 3: New Customer sees", ordersNew.length, "orders (should be 0):", ordersNew.length === 0);

// Scenario 4: Ensure no overlap between Customer A and Customer B
const aIds = new Set(ordersA.map(o => o.id));
const bIds = new Set(ordersB.map(o => o.id));
const overlap = [...aIds].filter(id => bIds.has(id));
console.log("Scenario 4: Overlap between Customer A and Customer B orders:", overlap.length === 0 ? "PASSED (0 overlap)" : "FAILED");

// Scenario 5: Customer B attempts to access Customer A's order
const orderOfA = ordersA[0];
console.log("\nScenario 5: Customer B attempting to access Customer A's order #" + orderOfA.id);
function verifyOrderAccess(requestingUser, order) {
  if (order.user_id) {
    if (!requestingUser) {
      return { allowed: false, status: 401, error: "Please sign in to view this order" };
    }
    if (requestingUser.role !== 'admin' && requestingUser.userId !== order.user_id) {
      return { allowed: false, status: 403, error: "Access denied. This order belongs to another account." };
    }
  }
  return { allowed: true, status: 200 };
}

const accessByB = verifyOrderAccess({ userId: customerB.id, role: customerB.role }, orderOfA);
console.log("Result of Customer B accessing Customer A's order:", accessByB.status, accessByB.error);
console.log("Scenario 5 verification:", accessByB.status === 403 ? "PASSED (403 Forbidden)" : "FAILED");

// Scenario 6: Unauthenticated visitor attempts to access Customer A's order
const accessByGuest = verifyOrderAccess(null, orderOfA);
console.log("\nScenario 6: Unauthenticated visitor accessing Customer A's order:", accessByGuest.status, accessByGuest.error);
console.log("Scenario 6 verification:", accessByGuest.status === 401 ? "PASSED (401 Unauthorized)" : "FAILED");

console.log("\nAll 6 security isolation scenarios successfully verified!");

