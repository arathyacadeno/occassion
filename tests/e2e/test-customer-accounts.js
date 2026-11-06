const { sql, queryNeon, loadModule, createTestToken, createRequest } = require("./helpers");

async function runCustomerAccountTests() {
  console.log("=================================================");
  console.log("   SECTION 2: CUSTOMER ACCOUNT TESTING (NEON)    ");
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

  // Load route modules
  const ordersRoute = loadModule("src/app/api/orders/route.ts");
  const orderIdRoute = loadModule("src/app/api/orders/[id]/route.ts");
  const profileRoute = loadModule("src/app/api/auth/profile/route.ts");
  const cartRoute = loadModule("src/app/api/cart/route.ts");
  const wishlistRoute = loadModule("src/app/api/wishlist/route.ts");
  const addressRoute = loadModule("src/app/api/addresses/route.ts");

  const customerA = { id: "usr-g-870oidpamuwd9myi", email: "arathy.tp@occasions.in", name: "Arathy TP", role: "customer" };
  const customerB = { id: "usr-g-kdlxdv4fmv9gk0z7", email: "arathy.tp.test2@gmail.com", name: "Arathy TP 2", role: "customer" };
  const customerC = { id: "usr-g-04ll4j4pmw3fcqs9", email: "new.customer@occasions.in", name: "New Customer", role: "customer" };

  const tokenA = createTestToken(customerA);
  const tokenB = createTestToken(customerB);
  const tokenC = createTestToken(customerC);

  // 2.1 Customer A Profile and Orders
  try {
    const reqProfileA = createRequest("http://localhost:3000/api/auth/profile", { token: tokenA });
    const resProfileA = await profileRoute.GET(reqProfileA);
    const dataProfileA = await resProfileA.json();

    assert(resProfileA.status === 200 && dataProfileA.user?.id === customerA.id, "2.1 Customer A profile retrieved successfully");

    const reqOrdersA = createRequest("http://localhost:3000/api/orders", { token: tokenA });
    const resOrdersA = await ordersRoute.GET(reqOrdersA);
    const dataOrdersA = await resOrdersA.json();

    assert(resOrdersA.status === 200 && dataOrdersA.success === true, "2.1 Customer A orders fetch returns 200");
    assert(Array.isArray(dataOrdersA.orders) && dataOrdersA.orders.length > 0, "2.1 Customer A has order history in Neon");
    assert(dataOrdersA.orders.every(o => o.user_id === customerA.id), "2.1 All orders in list belong strictly to Customer A");

    const orderAId = dataOrdersA.orders[0]?.id;

    // 2.2 Customer B Cannot Access Customer A's Information
    // B attempts to access A's specific order by query id: /api/orders?id=ORDER_A_ID
    const reqTrackA_byB = createRequest(`http://localhost:3000/api/orders?id=${orderAId}`, { token: tokenB });
    const resTrackA_byB = await ordersRoute.GET(reqTrackA_byB);
    const dataTrackA_byB = await resTrackA_byB.json();

    assert(resTrackA_byB.status === 403, "2.2 Customer B querying Customer A's order returns 403 Forbidden");
    assert(dataTrackA_byB.success === false, "2.2 Cross-customer order lookup is rejected");

    // B attempts direct order detail route: /api/orders/[id]
    const reqDetailA_byB = createRequest(`http://localhost:3000/api/orders/${orderAId}`, { token: tokenB });
    const resDetailA_byB = await orderIdRoute.GET(reqDetailA_byB, { params: Promise.resolve({ id: orderAId }) });
    assert(resDetailA_byB.status === 403, "2.2 Customer B fetching Customer A's order detail route returns 403 Forbidden");

    // Customer B lists their own orders
    const reqOrdersB = createRequest("http://localhost:3000/api/orders", { token: tokenB });
    const resOrdersB = await ordersRoute.GET(reqOrdersB);
    const dataOrdersB = await resOrdersB.json();

    assert(resOrdersB.status === 200 && dataOrdersB.success === true, "2.2 Customer B orders fetch returns 200");
    assert(dataOrdersB.orders.every(o => o.user_id === customerB.id), "2.2 Customer B orders contain ONLY Customer B's orders");
    assert(!dataOrdersB.orders.some(o => o.user_id === customerA.id), "2.2 Zero Customer A orders leaked into Customer B's order list");
  } catch (err) {
    assert(false, "2.1/2.2 Customer profile & cross-access", err.message);
  }

  // 2.3 New Customer C (Empty State)
  try {
    const reqOrdersC = createRequest("http://localhost:3000/api/orders", { token: tokenC });
    const resOrdersC = await ordersRoute.GET(reqOrdersC);
    const dataOrdersC = await resOrdersC.json();

    assert(resOrdersC.status === 200, "2.3 New customer C orders list returns 200 OK");
    assert(dataOrdersC.orders && dataOrdersC.orders.length === 0, "2.3 New customer C has exactly 0 orders (No Orders Yet)");
    assert(dataOrdersC.count === 0, "2.3 New customer C order count is 0");
  } catch (err) {
    assert(false, "2.3 New customer empty state", err.message);
  }

  // 2.4 Cart Isolation Between Accounts
  try {
    const validProductId = "bouquet-rose-royale";
    // Customer A adds item to cart
    const reqAddCartA = createRequest("http://localhost:3000/api/cart", {
      method: "POST",
      token: tokenA,
      body: { productId: validProductId, quantity: 2 },
    });
    const resAddCartA = await cartRoute.POST(reqAddCartA);
    assert(resAddCartA.status === 200, "2.4 Customer A adds item to cart in Neon");

    // Customer A fetches cart
    const reqGetCartA = createRequest("http://localhost:3000/api/cart", { token: tokenA });
    const resGetCartA = await cartRoute.GET(reqGetCartA);
    const dataGetCartA = await resGetCartA.json();
    assert(dataGetCartA.items && dataGetCartA.items.length > 0, "2.4 Customer A cart contains the added item");

    // Customer B fetches cart
    const reqGetCartB = createRequest("http://localhost:3000/api/cart", { token: tokenB });
    const resGetCartB = await cartRoute.GET(reqGetCartB);
    const dataGetCartB = await resGetCartB.json();
    assert(!dataGetCartB.items.some(i => i.user_id === customerA.id), "2.4 Customer B cannot see Customer A's cart items (Strict Cart Isolation)");

    // Customer C fetches cart
    const reqGetCartC = createRequest("http://localhost:3000/api/cart", { token: tokenC });
    const resGetCartC = await cartRoute.GET(reqGetCartC);
    const dataGetCartC = await resGetCartC.json();
    assert(dataGetCartC.items && dataGetCartC.items.length === 0, "2.4 New customer C cart is completely empty");

    // Cleanup Customer A cart in Neon
    await queryNeon(() => sql`DELETE FROM cart_items WHERE user_id = ${customerA.id}`);
  } catch (err) {
    assert(false, "2.4 Cart isolation", err.message);
  }

  // 2.5 Wishlist Isolation Between Accounts
  try {
    const validProductId = "bouquet-rose-royale";
    // Customer A adds item to wishlist
    const reqAddWishA = createRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      token: tokenA,
      body: { productId: validProductId },
    });
    const resAddWishA = await wishlistRoute.POST(reqAddWishA);
    assert(resAddWishA.status === 200, "2.5 Customer A adds item to wishlist in Neon");

    // Customer B fetches wishlist
    const reqGetWishB = createRequest("http://localhost:3000/api/wishlist", { token: tokenB });
    const resGetWishB = await wishlistRoute.GET(reqGetWishB);
    const dataGetWishB = await resGetWishB.json();
    assert(!dataGetWishB.items.some(w => w.user_id === customerA.id), "2.5 Customer B cannot see Customer A's wishlist items");

    // Customer C fetches wishlist
    const reqGetWishC = createRequest("http://localhost:3000/api/wishlist", { token: tokenC });
    const resGetWishC = await wishlistRoute.GET(reqGetWishC);
    const dataGetWishC = await resGetWishC.json();
    assert(dataGetWishC.items && dataGetWishC.items.length === 0, "2.5 New customer C wishlist is empty");

    // Cleanup Customer A wishlist in Neon
    await queryNeon(() => sql`DELETE FROM wishlist_items WHERE user_id = ${customerA.id}`);
  } catch (err) {
    assert(false, "2.5 Wishlist isolation", err.message);
  }

  // 2.6 Saved Addresses Isolation Between Accounts
  try {
    const testAddr = {
      fullName: "Arathy TP",
      phone: "+91 8606464700",
      house: "Flat 4B, Sky Tower",
      street: "Mavoor Road",
      area: "Arayidathupalam",
      city: "Kozhikode",
      state: "Kerala",
      pinCode: "673004",
      type: "Home",
      isDefault: true,
    };

    const reqAddAddrA = createRequest("http://localhost:3000/api/addresses", {
      method: "POST",
      token: tokenA,
      body: testAddr,
    });
    const resAddAddrA = await addressRoute.POST(reqAddAddrA);
    const dataAddAddrA = await resAddAddrA.json();
    assert(resAddAddrA.status === 200 && dataAddAddrA.success === true, "2.6 Customer A creates address in Neon");

    const createdAddrId = dataAddAddrA.address?.id;

    // Customer B fetches addresses
    const reqGetAddrB = createRequest("http://localhost:3000/api/addresses", { token: tokenB });
    const resGetAddrB = await addressRoute.GET(reqGetAddrB);
    const dataGetAddrB = await resGetAddrB.json();
    assert(!dataGetAddrB.addresses.some(a => a.id === createdAddrId || a.user_id === customerA.id), "2.6 Customer B cannot see Customer A's saved addresses");

    // Customer C fetches addresses
    const reqGetAddrC = createRequest("http://localhost:3000/api/addresses", { token: tokenC });
    const resGetAddrC = await addressRoute.GET(reqGetAddrC);
    const dataGetAddrC = await resGetAddrC.json();
    assert(dataGetAddrC.addresses && dataGetAddrC.addresses.length === 0, "2.6 New customer C has 0 saved addresses");

    // Cleanup address in Neon
    if (createdAddrId) {
      await queryNeon(() => sql`DELETE FROM addresses WHERE id = ${createdAddrId}`);
    }
  } catch (err) {
    assert(false, "2.6 Address isolation", err.message);
  }

  console.log(`\nSection 2 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  return results;
}

runCustomerAccountTests().catch(console.error);
