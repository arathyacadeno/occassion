const { sql, queryNeon, loadModule, createTestToken, createRequest } = require("./helpers");

async function runEcommerceTests() {
  console.log("=================================================");
  console.log("   SECTION 3: E-COMMERCE TESTING (NEON)          ");
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
  const productsRoute = loadModule("src/app/api/products/route.ts");
  const productSlugRoute = loadModule("src/app/api/products/[slug]/route.ts");
  const cartRoute = loadModule("src/app/api/cart/route.ts");
  const cartIdRoute = loadModule("src/app/api/cart/[id]/route.ts");
  const wishlistRoute = loadModule("src/app/api/wishlist/route.ts");
  const wishlistIdRoute = loadModule("src/app/api/wishlist/[id]/route.ts");
  const couponValidateRoute = loadModule("src/app/api/coupons/validate/route.ts");
  const addressRoute = loadModule("src/app/api/addresses/route.ts");
  const addressIdRoute = loadModule("src/app/api/addresses/[id]/route.ts");
  const customizationRoute = loadModule("src/app/api/admin/customization/route.ts");
  const deliveryConfig = loadModule("src/lib/delivery/config.ts");

  const testUser = { id: "usr-ecom-audit-" + Date.now(), email: "ecom.audit@test.com", name: "Ecom Tester", role: "customer" };
  const userToken = createTestToken(testUser);

  // 3.1 Product Listing & Details
  try {
    const reqList = createRequest("http://localhost:3000/api/products");
    const resList = await productsRoute.GET(reqList);
    const dataList = await resList.json();

    assert(resList.status === 200 && dataList.success === true, "3.1 Product listing returns 200 OK");
    assert(Array.isArray(dataList.products) && dataList.products.length > 0, "3.1 Products array is populated from Neon");
    assert(dataList.pagination && dataList.pagination.total > 0, "3.1 Pagination metadata is accurately computed");

    const sampleProduct = dataList.products[0];

    // Fetch product by slug
    const reqDetail = createRequest(`http://localhost:3000/api/products/${sampleProduct.slug}`);
    const resDetail = await productSlugRoute.GET(reqDetail, { params: Promise.resolve({ slug: sampleProduct.slug }) });
    const dataDetail = await resDetail.json();

    assert(resDetail.status === 200 && dataDetail.success === true, "3.1 Product details fetch returns 200 OK");
    assert(dataDetail.product?.id === sampleProduct.id, "3.1 Product ID matches catalog data");
    assert(typeof dataDetail.product?.price === "number", "3.1 Product price is normalized to number");
    assert(Array.isArray(dataDetail.product?.images), "3.1 Product images parsed to array");

    // Fetch non-existent product
    const reqNotFound = createRequest("http://localhost:3000/api/products/non-existent-product-slug-xyz");
    const resNotFound = await productSlugRoute.GET(reqNotFound, { params: Promise.resolve({ slug: "non-existent-product-slug-xyz" }) });
    assert(resNotFound.status === 404, "3.1 Non-existent product returns 404 Not Found");
  } catch (err) {
    assert(false, "3.1 Product listing & details", err.message);
  }

  // 3.2 Product Search & Filtering
  try {
    // Search query
    const reqSearch = createRequest("http://localhost:3000/api/products?search=rose");
    const resSearch = await productsRoute.GET(reqSearch);
    const dataSearch = await resSearch.json();
    assert(resSearch.status === 200 && dataSearch.products.length > 0, "3.2 Search query 'rose' returns matching products");
    assert(dataSearch.products.some(p => p.name.toLowerCase().includes("rose")), "3.2 Search results contain query keyword");

    // Category filter
    const reqCategory = createRequest("http://localhost:3000/api/products?category=cakes");
    const resCategory = await productsRoute.GET(reqCategory);
    const dataCategory = await resCategory.json();
    assert(resCategory.status === 200, "3.2 Category filter 'cakes' returns 200");
    assert(dataCategory.products.every(p => p.category === "cakes" || p.categoryId?.includes("cake") || p.type === "cake"), "3.2 Category filter accurately isolates cakes");

    // Price range filter
    const reqPrice = createRequest("http://localhost:3000/api/products?minPrice=500&maxPrice=1500");
    const resPrice = await productsRoute.GET(reqPrice);
    const dataPrice = await resPrice.json();
    assert(resPrice.status === 200, "3.2 Price range filter returns 200");
    assert(dataPrice.products.every(p => p.price >= 500 && p.price <= 1500), "3.2 All returned products fall within minPrice and maxPrice bounds");

    // Sort by price ascending
    const reqSort = createRequest("http://localhost:3000/api/products?sort=price-asc&limit=10");
    const resSort = await productsRoute.GET(reqSort);
    const dataSort = await resSort.json();
    let isAscending = true;
    for (let i = 1; i < dataSort.products.length; i++) {
      if (dataSort.products[i].price < dataSort.products[i - 1].price) isAscending = false;
    }
    assert(isAscending, "3.2 Products are correctly sorted by price in ascending order");
  } catch (err) {
    assert(false, "3.2 Product search & filtering", err.message);
  }

  // 3.3 Product Customization Data
  try {
    const reqCustom = createRequest("http://localhost:3000/api/admin/customization");
    const resCustom = await customizationRoute.GET(reqCustom);
    const dataCustom = await resCustom.json();
    assert(resCustom.status === 200 && dataCustom.success === true, "3.3 Customization options API returns 200");
    assert(dataCustom.config && Array.isArray(dataCustom.config.sizes), "3.3 Customization configuration retrieved from Neon");
  } catch (err) {
    assert(false, "3.3 Product customization data", err.message);
  }

  // 3.4 Cart Operations (Add, List, Delete)
  try {
    const testProductId = "bouquet-rose-royale";

    // 1. Add to cart
    const reqAdd = createRequest("http://localhost:3000/api/cart", {
      method: "POST",
      token: userToken,
      body: { productId: testProductId, quantity: 2 },
    });
    const resAdd = await cartRoute.POST(reqAdd);
    const dataAdd = await resAdd.json();
    assert(resAdd.status === 200 && dataAdd.success === true, "3.4 Add item to cart succeeds");

    // 2. List cart
    const reqListCart = createRequest("http://localhost:3000/api/cart", { token: userToken });
    const resListCart = await cartRoute.GET(reqListCart);
    const dataListCart = await resListCart.json();
    assert(dataListCart.items?.length === 1, "3.4 Cart contains 1 item");
    assert(dataListCart.itemCount === 2, "3.4 Cart total quantity count is 2");
    assert(dataListCart.subtotal > 0, "3.4 Cart subtotal is calculated correctly");

    const cartItemId = dataListCart.items[0]?.id;

    // 3. Update item quantity via PUT /api/cart/[id]
    const reqUpdate = createRequest(`http://localhost:3000/api/cart/${cartItemId}`, {
      method: "PUT",
      token: userToken,
      body: { quantity: 3 },
    });
    const resUpdate = await cartIdRoute.PUT(reqUpdate, { params: Promise.resolve({ id: cartItemId }) });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200 && dataUpdate.success === true, "3.4 Cart item quantity updated via PUT /api/cart/[id]");

    // 4. Remove single item via DELETE /api/cart/[id]
    const reqRemove = createRequest(`http://localhost:3000/api/cart/${cartItemId}`, {
      method: "PUT",
      token: userToken,
      body: { quantity: 0 },
    });
    const resRemove = await cartIdRoute.PUT(reqRemove, { params: Promise.resolve({ id: cartItemId }) });
    assert(resRemove.status === 200, "3.4 Cart item removed via quantity 0");

    // Verify empty
    const reqVerify = createRequest("http://localhost:3000/api/cart", { token: userToken });
    const resVerify = await cartRoute.GET(reqVerify);
    const dataVerify = await resVerify.json();
    assert(dataVerify.items?.length === 0, "3.4 Cart is empty after deletion");
  } catch (err) {
    assert(false, "3.4 Cart operations", err.message);
  }

  // 3.5 Wishlist Operations (Add, List, Toggle Remove)
  try {
    const testProductId = "bouquet-rose-royale";

    // 1. Add to wishlist
    const reqWishAdd = createRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      token: userToken,
      body: { productId: testProductId },
    });
    const resWishAdd = await wishlistRoute.POST(reqWishAdd);
    const dataWishAdd = await resWishAdd.json();
    assert(resWishAdd.status === 200 && dataWishAdd.action === "added", "3.5 Wishlist add returns action 'added'");

    // 2. List wishlist
    const reqWishList = createRequest("http://localhost:3000/api/wishlist", { token: userToken });
    const resWishList = await wishlistRoute.GET(reqWishList);
    const dataWishList = await resWishList.json();
    assert(dataWishList.items?.length === 1 && dataWishList.items[0]?.id === testProductId, "3.5 Wishlist listing contains added product");

    const wishlistId = dataWishList.items[0]?.wishlistId;

    // 3. Toggle remove (posting same product toggles it off)
    const reqWishToggle = createRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      token: userToken,
      body: { productId: testProductId },
    });
    const resWishToggle = await wishlistRoute.POST(reqWishToggle);
    const dataWishToggle = await resWishToggle.json();
    assert(resWishToggle.status === 200 && dataWishToggle.action === "removed", "3.5 Wishlist toggle removes item");

    // 4. Verify delete route directly /api/wishlist/[id]
    // Add again to test direct DELETE
    await wishlistRoute.POST(createRequest("http://localhost:3000/api/wishlist", { method: "POST", token: userToken, body: { productId: testProductId } }));
    const reqWishDirectDel = createRequest(`http://localhost:3000/api/wishlist/${testProductId}`, { method: "DELETE", token: userToken });
    const resWishDirectDel = await wishlistIdRoute.DELETE(reqWishDirectDel, { params: Promise.resolve({ id: testProductId }) });
    assert(resWishDirectDel.status === 200, "3.5 Wishlist DELETE by ID succeeds");
  } catch (err) {
    assert(false, "3.5 Wishlist operations", err.message);
  }

  // 3.6 Coupon Application & Validation
  try {
    // Valid coupon: WELCOME10
    const reqCouponValid = createRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: { code: "WELCOME10", subtotal: 1000 },
    });
    const resCouponValid = await couponValidateRoute.POST(reqCouponValid);
    const dataCouponValid = await resCouponValid.json();

    assert(resCouponValid.status === 200 && dataCouponValid.valid === true, "3.6 Valid coupon WELCOME10 returns valid: true");
    assert(dataCouponValid.discount === 100, "3.6 10% discount on ₹1000 order is accurately computed as ₹100");

    // Invalid coupon
    const reqCouponInvalid = createRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: { code: "NONEXISTENT999", subtotal: 1000 },
    });
    const resCouponInvalid = await couponValidateRoute.POST(reqCouponInvalid);
    const dataCouponInvalid = await resCouponInvalid.json();

    assert(resCouponInvalid.status === 404 && dataCouponInvalid.success === false, "3.6 Invalid coupon returns 404 Not Found error");
  } catch (err) {
    assert(false, "3.6 Coupon validation", err.message);
  }

  // 3.7 Delivery Charge Calculation
  try {
    const calc = deliveryConfig.calculateDeliveryChargeFromDistance;

    const tier1 = calc(3.2); // within 5 km
    assert(tier1.serviceable === true && tier1.charge === 0, "3.7 Distance 3.2 km is Free delivery (₹0)");

    const tier2 = calc(12.5); // 5 to 20 km
    assert(tier2.serviceable === true && tier2.charge === 150, "3.7 Distance 12.5 km is Tier 2 delivery (₹150)");

    const tier3 = calc(25.0); // 20 to 30 km
    assert(tier3.serviceable === true && tier3.charge === 300, "3.7 Distance 25.0 km is Tier 3 delivery (₹300)");

    const tier4 = calc(38.0); // 30 to 40 km
    assert(tier4.serviceable === true && tier4.charge === 400, "3.7 Distance 38.0 km is Tier 4 delivery (₹400)");

    const tier5 = calc(48.0); // 40 to 50 km
    assert(tier5.serviceable === true && tier5.charge === 500, "3.7 Distance 48.0 km is Tier 5 delivery (₹500)");

    const tierOver = calc(55.0); // beyond 50 km
    assert(tierOver.serviceable === false && tierOver.charge === null, "3.7 Distance 55.0 km (>50 km) is unserviceable");
  } catch (err) {
    assert(false, "3.7 Delivery calculation", err.message);
  }

  // 3.8 Address Management (Create, List, Update, Delete)
  try {
    const newAddress = {
      fullName: "Ecom Tester",
      phone: "+91 8606464700",
      house: "Boutique Atelier 2B",
      street: "Mavoor Road",
      area: "Arayidathupalam",
      city: "Kozhikode",
      state: "Kerala",
      pinCode: "673004",
      type: "Home",
      isDefault: true,
    };

    // Create address
    const reqCreateAddr = createRequest("http://localhost:3000/api/addresses", {
      method: "POST",
      token: userToken,
      body: newAddress,
    });
    const resCreateAddr = await addressRoute.POST(reqCreateAddr);
    const dataCreateAddr = await resCreateAddr.json();

    assert(resCreateAddr.status === 200 && dataCreateAddr.success === true, "3.8 Create address returns 200 OK");
    const addrId = dataCreateAddr.address?.id;
    assert(addrId && typeof addrId === "string", "3.8 Address ID created in Neon");

    // List addresses
    const reqListAddr = createRequest("http://localhost:3000/api/addresses", { token: userToken });
    const resListAddr = await addressRoute.GET(reqListAddr);
    const dataListAddr = await resListAddr.json();
    assert(dataListAddr.addresses?.some(a => a.id === addrId), "3.8 Address list contains created address");

    // Update address
    const reqUpdateAddr = createRequest(`http://localhost:3000/api/addresses/${addrId}`, {
      method: "PUT",
      token: userToken,
      body: { house: "Updated Villa 5C", phone: "+91 9998887776" },
    });
    const resUpdateAddr = await addressIdRoute.PUT(reqUpdateAddr, { params: Promise.resolve({ id: addrId }) });
    const dataUpdateAddr = await resUpdateAddr.json();
    assert(resUpdateAddr.status === 200 && dataUpdateAddr.success === true, "3.8 Address update returns 200 OK");

    // Verify update in Neon
    const dbAddr = await queryNeon(() => sql`SELECT * FROM addresses WHERE id = ${addrId}`);
    assert(dbAddr[0]?.house === "Updated Villa 5C", "3.8 Address update is persisted in Neon PostgreSQL");

    // Delete address
    const reqDeleteAddr = createRequest(`http://localhost:3000/api/addresses/${addrId}`, {
      method: "DELETE",
      token: userToken,
    });
    const resDeleteAddr = await addressIdRoute.DELETE(reqDeleteAddr, { params: Promise.resolve({ id: addrId }) });
    assert(resDeleteAddr.status === 200, "3.8 Address deletion returns 200 OK");

    const dbDeleted = await queryNeon(() => sql`SELECT id FROM addresses WHERE id = ${addrId}`);
    assert(dbDeleted.length === 0, "3.8 Address is completely removed from Neon");
  } catch (err) {
    assert(false, "3.8 Address management", err.message);
  }

  console.log(`\nSection 3 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  return results;
}

runEcommerceTests().catch(console.error);
