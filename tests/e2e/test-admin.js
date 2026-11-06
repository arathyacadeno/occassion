/**
 * Occasions E-Commerce Platform - End-to-End Test Suite
 * Section 5: Admin Testing (Neon PostgreSQL Single Source of Truth)
 */

const { sql, queryNeon, loadModule, createTestToken, createRequest } = require("./helpers");

async function runAdminTests() {
  console.log("=================================================");
  console.log("   SECTION 5: ADMIN TESTING (NEON)               ");
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
  const statsRoute = loadModule("src/app/api/admin/stats/route.ts");
  const productsRoute = loadModule("src/app/api/products/route.ts");
  const productSlugRoute = loadModule("src/app/api/products/[slug]/route.ts");
  const categoriesRoute = loadModule("src/app/api/categories/route.ts");
  const categoryIdRoute = loadModule("src/app/api/categories/[id]/route.ts");
  const ordersRoute = loadModule("src/app/api/orders/route.ts");
  const orderIdRoute = loadModule("src/app/api/orders/[id]/route.ts");
  const couponsRoute = loadModule("src/app/api/coupons/route.ts");
  const deliveryAdminRoute = loadModule("src/app/api/admin/delivery/route.ts");
  const homepageAdminRoute = loadModule("src/app/api/admin/homepage/route.ts");
  const mediaAdminRoute = loadModule("src/app/api/admin/media/route.ts");

  // Tokens
  const adminUser = {
    userId: "usr-admin-test-01",
    email: "admin@occasions.com",
    name: "Occasions Admin",
    role: "admin",
  };
  const adminToken = createTestToken(adminUser);

  const customerUser = {
    userId: "usr-g-870oidpamuwd9myi",
    email: "arathy@occasions.test",
    name: "Arathy Customer",
    role: "customer",
  };
  const customerToken = createTestToken(customerUser);

  // 5.1 Admin Role-Based Access Control (RBAC)
  try {
    // Customer accessing admin stats
    const reqCustStats = createRequest("http://localhost:3000/api/admin/stats", { token: customerToken });
    const resCustStats = await statsRoute.GET(reqCustStats);
    assert(resCustStats.status === 403, "5.1 Customer access to admin stats returns 403 Forbidden");

    // Unauthenticated access
    const reqAnonStats = createRequest("http://localhost:3000/api/admin/stats");
    const resAnonStats = await statsRoute.GET(reqAnonStats);
    assert(resAnonStats.status === 403, "5.1 Unauthenticated access to admin stats returns 403 Forbidden");

    // Admin access
    const reqAdminStats = createRequest("http://localhost:3000/api/admin/stats", { token: adminToken });
    const resAdminStats = await statsRoute.GET(reqAdminStats);
    const dataAdminStats = await resAdminStats.json();
    assert(resAdminStats.status === 200 && dataAdminStats.success === true, "5.1 Admin access to stats returns 200 OK");
  } catch (err) {
    assert(false, "5.1 Admin RBAC authorization", err.message);
  }

  // 5.2 Admin Dashboard Stats & Customer Management
  try {
    const reqAdminStats = createRequest("http://localhost:3000/api/admin/stats", { token: adminToken });
    const resAdminStats = await statsRoute.GET(reqAdminStats);
    const data = await resAdminStats.json();

    assert(data.stats !== undefined, "5.2 Stats object is present in response");
    assert(typeof data.stats.totalRevenue === "number", "5.2 Total revenue is calculated as a number");
    assert(typeof data.stats.totalOrders === "number", "5.2 Total orders count is returned");
    assert(typeof data.stats.totalCustomers === "number", "5.2 Total customers count is returned");
    assert(Array.isArray(data.users), "5.2 Customers list is returned as array");
    assert(data.users.every((u) => u.role === "customer"), "5.2 Customers list contains only customers (no leaked admin roles)");
    assert(Array.isArray(data.recentOrders), "5.2 Recent orders list is returned");
    assert(Array.isArray(data.lowStockItems), "5.2 Low stock items list is returned");
  } catch (err) {
    assert(false, "5.2 Admin stats & customer management", err.message);
  }

  // 5.3 Product Management (Admin Create, Update, Delete)
  const testNewProductId = "prod-test-admin-lily";
  const testNewProductSlug = "prod-test-admin-lily";
  try {
    // 1. Customer attempt to create product -> 403
    const reqCustProdCreate = createRequest("http://localhost:3000/api/products", {
      method: "POST",
      token: customerToken,
      body: { name: "Hacked Flower", price: 100 },
    });
    const resCustProdCreate = await productsRoute.POST(reqCustProdCreate);
    assert(resCustProdCreate.status === 403, "5.3 Customer forbidden (403) from creating products");

    // 2. Admin creates product in Neon
    const reqAdminProdCreate = createRequest("http://localhost:3000/api/products", {
      method: "POST",
      token: adminToken,
      body: {
        id: testNewProductId,
        name: "Test Admin Imperial Lily",
        slug: testNewProductSlug,
        description: "A gorgeous fresh imperial lily for testing admin operations.",
        price: 1500,
        originalPrice: 1800,
        stock: 50,
        categoryId: "cat-flower-bouquet",
        images: ["/images/lily-6-stems.png"],
      },
    });
    const resAdminProdCreate = await productsRoute.POST(reqAdminProdCreate);
    const dataAdminProdCreate = await resAdminProdCreate.json();
    assert(resAdminProdCreate.status === 200 && dataAdminProdCreate.success === true, "5.3 Admin successfully creates product (200 OK)");

    // Verify in Neon DB
    const dbProduct = (await queryNeon(() => sql`SELECT * FROM products WHERE id = ${testNewProductId}`))[0];
    assert(Boolean(dbProduct), "5.3 Created product exists in Neon products table");
    assert(Number(dbProduct.price) === 1500, "5.3 Product price correctly persisted in Neon as 1500");

    // 3. Admin updates product (price, stock)
    const reqAdminProdUpdate = createRequest(`http://localhost:3000/api/products/${testNewProductSlug}`, {
      method: "PUT",
      token: adminToken,
      body: { price: 1650, stock: 75 },
    });
    const resAdminProdUpdate = await productSlugRoute.PUT(reqAdminProdUpdate, {
      params: Promise.resolve({ slug: testNewProductSlug }),
    });
    assert(resAdminProdUpdate.status === 200, "5.3 Admin updates product returns 200 OK");

    const updatedDbProduct = (await queryNeon(() => sql`SELECT price, stock FROM products WHERE id = ${testNewProductId}`))[0];
    assert(Number(updatedDbProduct.price) === 1650 && Number(updatedDbProduct.stock) === 75, "5.3 Price (1650) & Stock (75) updated in Neon");

    // 4. Admin deletes test product
    const reqAdminProdDelete = createRequest(`http://localhost:3000/api/products/${testNewProductSlug}`, {
      method: "DELETE",
      token: adminToken,
    });
    const resAdminProdDelete = await productSlugRoute.DELETE(reqAdminProdDelete, {
      params: Promise.resolve({ slug: testNewProductSlug }),
    });
    assert(resAdminProdDelete.status === 200, "5.3 Admin deletes un-ordered test product returns 200 OK");

    const deletedCheck = await queryNeon(() => sql`SELECT id FROM products WHERE id = ${testNewProductId}`);
    assert(deletedCheck.length === 0, "5.3 Product permanently removed from Neon");
  } catch (err) {
    assert(false, "5.3 Product management", err.message);
  }

  // 5.4 Category Management (Admin Create, Update)
  const testCategoryId = "cat-test-celebration";
  try {
    // 1. Customer forbidden
    const reqCustCat = createRequest("http://localhost:3000/api/categories", {
      method: "POST",
      token: customerToken,
      body: { name: "Test Category" },
    });
    const resCustCat = await categoriesRoute.POST(reqCustCat);
    assert(resCustCat.status === 403, "5.4 Customer forbidden (403) from creating category");

    // 2. Admin creates category
    const reqAdminCat = createRequest("http://localhost:3000/api/categories", {
      method: "POST",
      token: adminToken,
      body: {
        id: testCategoryId,
        name: "Test Celebration",
        slug: "test-celebration",
        description: "Special celebration collection for tests",
        image: "/images/cat-flower-bouquet-luxe.jpg",
        displayOrder: 99,
        active: 1,
      },
    });
    const resAdminCat = await categoriesRoute.POST(reqAdminCat);
    assert(resAdminCat.status === 200, "5.4 Admin creates category returns 200 OK");

    const dbCat = (await queryNeon(() => sql`SELECT * FROM categories WHERE id = ${testCategoryId}`))[0];
    assert(Boolean(dbCat), "5.4 Category exists in Neon categories table");

    // 3. Admin updates category
    const reqAdminCatUpdate = createRequest(`http://localhost:3000/api/categories/${testCategoryId}`, {
      method: "PUT",
      token: adminToken,
      body: { name: "Updated Test Celebration", displayOrder: 88 },
    });
    const resAdminCatUpdate = await categoryIdRoute.PUT(reqAdminCatUpdate, {
      params: Promise.resolve({ id: testCategoryId }),
    });
    assert(resAdminCatUpdate.status === 200, "5.4 Admin updates category returns 200 OK");

    // Clean up test category
    await queryNeon(() => sql`DELETE FROM categories WHERE id = ${testCategoryId}`);
  } catch (err) {
    assert(false, "5.4 Category management", err.message);
  }

  // 5.5 Order Management (Admin View All & Status Update)
  try {
    // 1. Admin lists all orders across all customers
    const reqAdminOrders = createRequest("http://localhost:3000/api/orders", { token: adminToken });
    const resAdminOrders = await ordersRoute.GET(reqAdminOrders);
    const dataAdminOrders = await resAdminOrders.json();

    assert(resAdminOrders.status === 200 && dataAdminOrders.success === true, "5.5 Admin can fetch all customer orders (200 OK)");
    assert(Array.isArray(dataAdminOrders.orders), "5.5 Orders array is returned");
    assert(dataAdminOrders.orders.length > 0, "5.5 Global orders are populated for admin");

    const targetOrder = dataAdminOrders.orders[0];

    // 2. Customer forbidden from setting order status to 'delivered'
    const reqCustStatus = createRequest(`http://localhost:3000/api/orders/${targetOrder.id}`, {
      method: "PATCH",
      token: customerToken,
      body: { status: "delivered" },
    });
    const resCustStatus = await orderIdRoute.PATCH(reqCustStatus, {
      params: Promise.resolve({ id: targetOrder.id }),
    });
    assert(resCustStatus.status === 403, "5.5 Customer forbidden (403) from updating order status");

    // 3. Admin updates order status
    const reqAdminStatus = createRequest(`http://localhost:3000/api/orders/${targetOrder.id}`, {
      method: "PATCH",
      token: adminToken,
      body: { status: "preparing" },
    });
    const resAdminStatus = await orderIdRoute.PATCH(reqAdminStatus, {
      params: Promise.resolve({ id: targetOrder.id }),
    });
    assert(resAdminStatus.status === 200, "5.5 Admin updates order status to 'preparing' returns 200 OK");

    const dbUpdatedOrder = (await queryNeon(() => sql`SELECT order_status FROM orders WHERE id = ${targetOrder.id}`))[0];
    assert(dbUpdatedOrder?.order_status === "preparing", "5.5 Order status updated in Neon to 'preparing'");
  } catch (err) {
    assert(false, "5.5 Order management", err.message);
  }

  // 5.6 Coupon Management (Admin List All & Create)
  try {
    // 1. Admin lists coupons (sees full list)
    const reqAdminCoupons = createRequest("http://localhost:3000/api/coupons", { token: adminToken });
    const resAdminCoupons = await couponsRoute.GET(reqAdminCoupons);
    const dataAdminCoupons = await resAdminCoupons.json();
    assert(resAdminCoupons.status === 200 && Array.isArray(dataAdminCoupons.coupons), "5.6 Admin gets complete coupons list");

    // 2. Customer forbidden from creating coupon
    const reqCustCoupon = createRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      token: customerToken,
      body: { code: "HACK99", discountType: "percentage", discountValue: 99 },
    });
    const resCustCoupon = await couponsRoute.POST(reqCustCoupon);
    assert(resCustCoupon.status === 403, "5.6 Customer forbidden (403) from creating coupons");

    // 3. Admin creates coupon
    const reqAdminCreateCoupon = createRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      token: adminToken,
      body: {
        code: "TESTADMIN20",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 800,
        maxDiscount: 300,
      },
    });
    const resAdminCreateCoupon = await couponsRoute.POST(reqAdminCreateCoupon);
    assert(resAdminCreateCoupon.status === 200, "5.6 Admin creates coupon returns 200 OK");

    const dbCoupon = (await queryNeon(() => sql`SELECT * FROM coupons WHERE code = 'TESTADMIN20'`))[0];
    assert(Boolean(dbCoupon), "5.6 Created coupon TESTADMIN20 exists in Neon");

    // Clean up
    await queryNeon(() => sql`DELETE FROM coupons WHERE code = 'TESTADMIN20'`);
  } catch (err) {
    assert(false, "5.6 Coupon management", err.message);
  }

  // 5.7 Delivery Settings & Tiers
  try {
    // Customer forbidden
    const reqCustDel = createRequest("http://localhost:3000/api/admin/delivery", { token: customerToken });
    const resCustDel = await deliveryAdminRoute.GET(reqCustDel);
    assert(resCustDel.status === 403, "5.7 Customer forbidden (403) from admin delivery settings");

    // Admin access
    const reqAdminDel = createRequest("http://localhost:3000/api/admin/delivery", { token: adminToken });
    const resAdminDel = await deliveryAdminRoute.GET(reqAdminDel);
    const dataAdminDel = await resAdminDel.json();

    assert(resAdminDel.status === 200 && dataAdminDel.success === true, "5.7 Admin loads delivery tiers and settings (200 OK)");
    assert(Array.isArray(dataAdminDel.tiers) && dataAdminDel.tiers.length >= 5, "5.7 All 5 delivery tiers loaded from Neon");
    assert(dataAdminDel.settings?.shop_pin === "673001", "5.7 Calicut store origin PIN code is verified");
  } catch (err) {
    assert(false, "5.7 Delivery settings & tiers", err.message);
  }

  // 5.8 Homepage Banners & Sections
  try {
    // Customer forbidden
    const reqCustHome = createRequest("http://localhost:3000/api/admin/homepage", { token: customerToken });
    const resCustHome = await homepageAdminRoute.GET(reqCustHome);
    assert(resCustHome.status === 403, "5.8 Customer forbidden (403) from admin homepage settings");

    // Admin access
    const reqAdminHome = createRequest("http://localhost:3000/api/admin/homepage", { token: adminToken });
    const resAdminHome = await homepageAdminRoute.GET(reqAdminHome);
    const dataAdminHome = await resAdminHome.json();

    assert(resAdminHome.status === 200 && dataAdminHome.success === true, "5.8 Admin loads homepage config (200 OK)");
    assert(Array.isArray(dataAdminHome.banners), "5.8 Homepage banners array loaded from Neon");
    assert(Array.isArray(dataAdminHome.sections), "5.8 Homepage sections array loaded from Neon");
  } catch (err) {
    assert(false, "5.8 Homepage management", err.message);
  }

  // 5.9 Media Management
  try {
    const reqAdminMedia = createRequest("http://localhost:3000/api/admin/media", { token: adminToken });
    const resAdminMedia = await mediaAdminRoute.GET(reqAdminMedia);
    const dataAdminMedia = await resAdminMedia.json();

    assert(resAdminMedia.status === 200 && dataAdminMedia.success === true, "5.9 Admin loads media library (200 OK)");
    assert(Array.isArray(dataAdminMedia.media), "5.9 Media library array loaded from Neon");
    assert(dataAdminMedia.total > 0, "5.9 Media items count is verified from Neon");
  } catch (err) {
    assert(false, "5.9 Media management", err.message);
  }

  console.log(`\nSection 5 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runAdminTests().catch(console.error);
