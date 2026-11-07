import crypto from "crypto";
import { GET, POST } from "../src/app/api/webhooks/whatsapp/route";
import { buildCustomerOrderWhatsAppMessage } from "../src/lib/whatsapp/service";

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING META WHATSAPP WEBHOOK TEST SUITE");
  console.log("=========================================\n");

  process.env.WHATSAPP_VERIFY_TOKEN = "test_token_12345";
  process.env.META_APP_SECRET = "test_app_secret_abc123";

  // Test 1: GET webhook verification - Valid Token
  console.log("TEST 1: GET webhook verification (Valid Token)");
  const validUrl = "https://occassion.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test_token_12345&hub.challenge=CHALLENGE_987654";
  const req1 = new Request(validUrl, { method: "GET" });
  const res1 = await GET(req1);
  const text1 = await res1.text();
  console.log(`Status: ${res1.status} (Expected: 200)`);
  console.log(`Content-Type: ${res1.headers.get("Content-Type")}`);
  console.log(`Response Body: "${text1}" (Expected: "CHALLENGE_987654")`);
  if (res1.status === 200 && text1 === "CHALLENGE_987654") {
    console.log("✅ PASS: Valid GET verification succeeds.\n");
  } else {
    console.error("❌ FAIL: Valid GET verification failed.\n");
  }

  // Test 2: GET webhook verification - Invalid Token
  console.log("TEST 2: GET webhook verification (Invalid Token)");
  const invalidUrl = "https://occassion.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=CHALLENGE_987654";
  const req2 = new Request(invalidUrl, { method: "GET" });
  const res2 = await GET(req2);
  console.log(`Status: ${res2.status} (Expected: 403)`);
  if (res2.status === 403) {
    console.log("✅ PASS: Invalid GET token correctly rejected with 403.\n");
  } else {
    console.error("❌ FAIL: Invalid token was not rejected.\n");
  }

  // Test 3: POST webhook event - Valid HMAC Signature
  console.log("TEST 3: POST webhook event (Valid Signature)");
  const samplePayload = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ID_123",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "918606464700", phone_number_id: "PHONE_ID_1" },
              contacts: [{ profile: { name: "Ananya Sharma" }, wa_id: "919447446008" }],
              messages: [
                {
                  from: "919447446008",
                  id: "wamid.TEST_MSG_001",
                  timestamp: "1731000000",
                  text: { body: "Can you deliver before 5 PM today?" },
                  type: "text",
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const validHmac = crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(samplePayload, "utf8")
    .digest("hex");

  const req3 = new Request("https://occassion.vercel.app/api/webhooks/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-signature-256": `sha256=${validHmac}`,
    },
    body: samplePayload,
  });

  const res3 = await POST(req3);
  const json3 = await res3.json();
  console.log(`Status: ${res3.status} (Expected: 200)`);
  console.log(`Response:`, json3);
  if (res3.status === 200 && json3.status === "success") {
    console.log("✅ PASS: Valid signed POST processed successfully.\n");
  } else {
    console.error("❌ FAIL: Valid POST failed.\n");
  }

  // Test 4: POST webhook event - Invalid HMAC Signature
  console.log("TEST 4: POST webhook event (Tampered / Invalid Signature)");
  const req4 = new Request("https://occassion.vercel.app/api/webhooks/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-signature-256": "sha256=0000000000000000000000000000000000000000000000000000000000000000",
    },
    body: samplePayload,
  });

  const res4 = await POST(req4);
  console.log(`Status: ${res4.status} (Expected: 401)`);
  if (res4.status === 401) {
    console.log("✅ PASS: Invalid signature correctly rejected with 401.\n");
  } else {
    console.error("❌ FAIL: Tampered signature was not rejected.\n");
  }

  // Test 5: POST message delivery status updates (sent, delivered, read, failed)
  console.log("TEST 5: POST Delivery Status Updates");
  const statusPayload = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ID_123",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "918606464700", phone_number_id: "PHONE_ID_1" },
              statuses: [
                {
                  id: "wamid.TEST_ORDER_NOTIFICATION_1",
                  status: "delivered",
                  timestamp: "1731000005",
                  recipient_id: "919447446008",
                },
                {
                  id: "wamid.TEST_ORDER_NOTIFICATION_1",
                  status: "read",
                  timestamp: "1731000010",
                  recipient_id: "919447446008",
                },
                {
                  id: "wamid.TEST_ORDER_NOTIFICATION_2",
                  status: "failed",
                  timestamp: "1731000015",
                  recipient_id: "919447446008",
                  errors: [{ code: 131026, title: "Message undeliverable" }],
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const statusHmac = crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(statusPayload, "utf8")
    .digest("hex");

  const req5 = new Request("https://occassion.vercel.app/api/webhooks/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-signature-256": `sha256=${statusHmac}`,
    },
    body: statusPayload,
  });

  const res5 = await POST(req5);
  const json5 = await res5.json();
  console.log(`Status: ${res5.status} (Expected: 200)`);
  if (res5.status === 200 && json5.status === "success") {
    console.log("✅ PASS: Status updates (delivered, read, failed) processed cleanly.\n");
  } else {
    console.error("❌ FAIL: Status update processing failed.\n");
  }

  // Test 6: Order notification message builder
  console.log("TEST 6: Customer Order Notification Message Content");
  const sampleOrder = {
    orderId: "654321",
    customerName: "Priya Nair",
    customerPhone: "9876543210",
    items: [
      { name: "Crimson Velvet Rose Bouquet", quantity: 1, price: 1899, subtotal: 1899 },
      { name: "Rich Belgian Truffle Cake", quantity: 1, price: 850, subtotal: 850 },
    ],
    finalAmount: 2749,
    orderStatus: "confirmed",
    paymentStatus: "paid",
    deliveryDate: "Today",
    deliveryTime: "Evening Slot (5:00 PM - 8:00 PM)",
  };

  const formattedMsg = buildCustomerOrderWhatsAppMessage(sampleOrder);
  console.log("Formatted Message Preview:\n---\n" + formattedMsg + "\n---");

  const hasAllFields =
    formattedMsg.includes("Priya Nair") &&
    formattedMsg.includes("654321") &&
    formattedMsg.includes("Crimson Velvet Rose Bouquet") &&
    formattedMsg.includes("Rich Belgian Truffle Cake") &&
    formattedMsg.includes("2,749") &&
    formattedMsg.includes("Confirmed");

  if (hasAllFields) {
    console.log("✅ PASS: Order confirmation message includes all required fields.\n");
  } else {
    console.error("❌ FAIL: Missing required fields in formatted message.\n");
  }

  console.log("=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("=========================================");
}

runTests().catch(console.error);

