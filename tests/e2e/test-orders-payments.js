/**
 * Occasions E-Commerce Platform - End-to-End Test Suite
 * Section 4: Order and Payment Testing (Neon PostgreSQL Single Source of Truth)
 */

const { sql, queryNeon, loadModule, createTestToken, createRequest } = require("./helpers");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function runOrderPaymentTests() {
  console.log("=================================================");
  console.log("   SECTION 4: ORDER & PAYMENT TESTING (NEON)     ");
  console.log("=================================================");

  const results = { passed: [], failed: [] };

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      results.passed.push(testName);
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${detail}`);
      results.failed.push({ testName, detail });
    }
  }

  const ordersRoute = loadModule("src/app/api/orders/route.ts");
  const orderIdRoute = loadModule("src/app/api/orders/[id]/route.ts");
  const verifyPaymentRoute = loadModule("src/app/api/verify-payment/route.ts");

  const customerA = {
    userId: "usr-g-870oidpamuwd9myi",
    email: "arathy@occasions.test",
    name: "Arathy Tester A",
    role: "customer",
  };
  const tokenA = createTestToken(customerA);

  const customerB = {
    userId: "usr-g-kdlxdv4fmv9gk0z7",
    email: "sarah@occasions.test",
    name: "Sarah Customer B",
    role: "customer",
  };
  const tokenB = createTestToken(customerB);

  const testProductId = "bouquet-rose-royale";
  let initialStock = 0;
  let createdOrderId = null;

  // Setup: Check initial stock in Neon
  try {
    const prodRows = await queryNeon(() => sql`SELECT stock, price FROM products WHERE id = ${testProductId}`);
    initialStock = Number(prodRows[0]?.stock || 0);
    console.log(`Initial stock for ${testProductId} in Neon: ${initialStock}`);
  } catch (err) {
    assert(false, "4.0 Neon database setup: fetch initial stock", err.message);
  }

  // 4.1 Place a test order with Customer A
  try {
    const orderPayload = {
      items: [{ productId: testProductId, quantity: 2 }],
      delivery: {
        fullName: "Arathy Tester A",
        mobile: "+91 9447446008",
        houseBuilding: "Rose Villa Flat 3B",
        street: "Mavoor Road",
        landmark: "Near Calicut Medical College",
        city: "Kozhikode",
        state: "Kerala",
        pinCode: "673008",
      },
      paymentMethod: { type: "ONLINE", label: "Razorpay" },
      couponCode: "OCCASIONS10",
      notes: "Please pack with extra care",
    };

    const reqCreate = createRequest("http://localhost:3000/api/orders", {
      method: "POST",
      token: tokenA,
      body: orderPayload,
    });
    const resCreate = await ordersRoute.POST(reqCreate);
    const dataCreate = await resCreate.json();

    assert(resCreate.status === 200 && dataCreate.success === true, "4.1 Order creation returns 200 OK");
    assert(dataCreate.orderId !== undefined && dataCreate.orderId !== null, "4.1 Order ID returned");
    createdOrderId = String(dataCreate.orderId);

    // 4.2 Verify Order is saved in Neon
    const neonOrder = (await queryNeon(() => sql`SELECT * FROM orders WHERE id = ${createdOrderId}`))[0];
    assert(Boolean(neonOrder), "4.2 Order record exists in Neon orders table");
    assert(neonOrder.user_id === customerA.userId, "4.2 Order user_id strictly matches authenticated Customer A ID");
    assert(neonOrder.order_status === "confirmed", "4.2 Initial order status is 'confirmed'");
    assert(neonOrder.coupon_code === "OCCASIONS10", "4.2 Applied coupon is recorded in Neon order");

    // 4.3 Verify Order Items in Neon
    const neonItems = await queryNeon(() => sql`SELECT * FROM order_items WHERE order_id = ${createdOrderId}`);
    assert(neonItems.length === 1, "4.3 Exactly 1 order item recorded in Neon order_items table");
    assert(neonItems[0].product_id === testProductId, "4.3 Order item product_id matches test product");
    assert(Number(neonItems[0].quantity) === 2, "4.3 Order item quantity recorded as 2");

    // 4.4 Verify Inventory Deduction
    const updatedStockRows = await queryNeon(() => sql`SELECT stock FROM products WHERE id = ${testProductId}`);
    const updatedStock = Number(updatedStockRows[0]?.stock || 0);
    assert(updatedStock === initialStock - 2, `4.4 Product stock decremented by 2 in Neon (${initialStock} -> ${updatedStock})`);

    // 4.5 Test Duplicate Order Prevention (within 60 seconds)
    const reqDuplicate = createRequest("http://localhost:3000/api/orders", {
      method: "POST",
      token: tokenA,
      body: orderPayload,
    });
    const resDuplicate = await ordersRoute.POST(reqDuplicate);
    const dataDuplicate = await resDuplicate.json();

    assert(resDuplicate.status === 200 && dataDuplicate.success === true, "4.5 Duplicate order submission returns 200 OK");
    assert(String(dataDuplicate.orderId) === createdOrderId, "4.5 Duplicate submission returns identical existing order ID (dedup triggered)");

    // Ensure stock was NOT decremented a second time
    const stockAfterDedup = Number((await queryNeon(() => sql`SELECT stock FROM products WHERE id = ${testProductId}`))[0]?.stock || 0);
    assert(stockAfterDedup === updatedStock, "4.5 Dedup prevented duplicate inventory deduction");
  } catch (err) {
    assert(false, "4.1 - 4.5 Order creation & inventory deduction", err.message);
  }

  // 4.6 Payment Verification and Security Testing
  try {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "occasions_test_razorpay_secret_12345";
    process.env.RAZORPAY_KEY_SECRET = razorpaySecret;

    const testRzpOrderId = `order_${Math.floor(100000 + Math.random() * 900000)}`;
    const testRzpPaymentId = `pay_${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Missing fields
    const reqMissing = createRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      body: { order_id: testRzpOrderId },
    });
    const resMissing = await verifyPaymentRoute.POST(reqMissing);
    assert(resMissing.status === 400, "4.6 Payment verification with missing fields returns 400 Bad Request");

    // 2. Tampered / invalid signature
    const reqInvalidSig = createRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      body: {
        order_id: testRzpOrderId,
        payment_id: testRzpPaymentId,
        signature: "tampered_fake_signature_hash_1234567890",
        orderId: createdOrderId,
      },
    });
    const resInvalidSig = await verifyPaymentRoute.POST(reqInvalidSig);
    assert(resInvalidSig.status === 400, "4.6 Tampered payment signature returns 400 Bad Request");

    // 3. Valid HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${testRzpOrderId}|${testRzpPaymentId}`)
      .digest("hex");

    const reqValidSig = createRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      body: {
        razorpay_order_id: testRzpOrderId,
        razorpay_payment_id: testRzpPaymentId,
        razorpay_signature: validSignature,
        orderId: createdOrderId,
      },
    });
    const resValidSig = await verifyPaymentRoute.POST(reqValidSig);
    const dataValidSig = await resValidSig.json();

    assert(resValidSig.status === 200 && dataValidSig.success === true, "4.6 Valid payment signature verified with 200 OK");

    // Verify Neon database updated payment_status to 'paid'
    const paidOrder = (await queryNeon(() => sql`SELECT payment_status FROM orders WHERE id = ${createdOrderId}`))[0];
    assert(paidOrder?.payment_status === "paid", "4.6 Neon orders table updated payment_status to 'paid'");
  } catch (err) {
    assert(false, "4.6 Payment verification testing", err.message);
  }

  // 4.7 Order Tracking and Customer-Wise Order Isolation
  try {
    // 1. Customer A tracks own order
    const reqTrackA = createRequest(`http://localhost:3000/api/orders?id=${createdOrderId}`, { token: tokenA });
    const resTrackA = await ordersRoute.GET(reqTrackA);
    const dataTrackA = await resTrackA.json();

    assert(resTrackA.status === 200 && dataTrackA.success === true, "4.7 Customer A can track own order with 200 OK");
    assert(dataTrackA.order.id === createdOrderId, "4.7 Track order returns correct order details");
    assert(Array.isArray(dataTrackA.order.trackingTimeline), "4.7 Tracking timeline is populated");

    // 2. Customer B attempts to track Customer A's order
    const reqTrackB = createRequest(`http://localhost:3000/api/orders?id=${createdOrderId}`, { token: tokenB });
    const resTrackB = await ordersRoute.GET(reqTrackB);
    assert(resTrackB.status === 403, "4.7 Customer B is forbidden (403) from tracking Customer A's order");

    // 3. Unauthenticated request attempts to track customer-owned order
    const reqTrackAnon = createRequest(`http://localhost:3000/api/orders?id=${createdOrderId}`);
    const resTrackAnon = await ordersRoute.GET(reqTrackAnon);
    assert(resTrackAnon.status === 401, "4.7 Unauthenticated user tracking customer-owned order gets 401 Unauthorized");

    // 4. Non-existent order ID
    const reqTrack404 = createRequest("http://localhost:3000/api/orders?id=999999999", { token: tokenA });
    const resTrack404 = await ordersRoute.GET(reqTrack404);
    assert(resTrack404.status === 404, "4.7 Non-existent order ID returns 404 Not Found");
  } catch (err) {
    assert(false, "4.7 Order tracking isolation", err.message);
  }

  // 4.8 Order Cancellation and Stock Restoration
  try {
    // 1. Customer B attempts to cancel Customer A's order
    const reqCancelB = createRequest(`http://localhost:3000/api/orders/${createdOrderId}`, {
      method: "PATCH",
      token: tokenB,
      body: { action: "cancel" },
    });
    const resCancelB = await orderIdRoute.PATCH(reqCancelB, { params: Promise.resolve({ id: createdOrderId }) });
    assert(resCancelB.status === 403, "4.8 Customer B cannot cancel Customer A's order (403 Forbidden)");

    // 2. Customer A cancels their order
    const reqCancelA = createRequest(`http://localhost:3000/api/orders/${createdOrderId}`, {
      method: "PATCH",
      token: tokenA,
      body: { action: "cancel" },
    });
    const resCancelA = await orderIdRoute.PATCH(reqCancelA, { params: Promise.resolve({ id: createdOrderId }) });
    const dataCancelA = await resCancelA.json();

    assert(resCancelA.status === 200 && dataCancelA.success === true, "4.8 Customer A cancels order successfully (200 OK)");

    // 3. Verify Neon DB order status updated to 'cancelled'
    const cancelledOrder = (await queryNeon(() => sql`SELECT order_status, payment_status FROM orders WHERE id = ${createdOrderId}`))[0];
    assert(cancelledOrder?.order_status === "cancelled", "4.8 Order status in Neon updated to 'cancelled'");

    // 4. Verify Stock Restoration in Neon
    const restoredStock = Number((await queryNeon(() => sql`SELECT stock FROM products WHERE id = ${testProductId}`))[0]?.stock || 0);
    assert(restoredStock === initialStock, `4.8 Stock fully restored in Neon upon cancellation (${restoredStock} === ${initialStock})`);

    // 5. Attempting to cancel an already cancelled order returns 400
    const reqCancelAgain = createRequest(`http://localhost:3000/api/orders/${createdOrderId}`, {
      method: "PATCH",
      token: tokenA,
      body: { action: "cancel" },
    });
    const resCancelAgain = await orderIdRoute.PATCH(reqCancelAgain, { params: Promise.resolve({ id: createdOrderId }) });
    assert(resCancelAgain.status === 400, "4.8 Attempt to re-cancel already cancelled order returns 400 Bad Request");
  } catch (err) {
    assert(false, "4.8 Order cancellation and stock restoration", err.message);
  }

  // Cleanup test orders and addresses from Neon
  try {
    if (createdOrderId) {
      await queryNeon(() => sql`DELETE FROM order_items WHERE order_id = ${createdOrderId}`);
      await queryNeon(() => sql`DELETE FROM orders WHERE id = ${createdOrderId}`);
    }
    await queryNeon(() => sql`DELETE FROM addresses WHERE full_name = 'Arathy Tester A'`);
    console.log("  [Cleanup] Test orders and address cleaned up from Neon.");
  } catch {}

  console.log(`\nSection 4 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runOrderPaymentTests().catch(console.error);
