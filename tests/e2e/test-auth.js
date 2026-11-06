const { sql, queryNeon, loadModule, createTestToken, createRequest } = require("./helpers");
const bcrypt = require("bcryptjs");

async function runAuthTests() {
  console.log("=================================================");
  console.log("   SECTION 1: AUTHENTICATION TESTING (NEON)      ");
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

  const timestamp = Date.now();
  const testEmail = `test.user.${timestamp}@occasions-audit.com`;
  const testPassword = "AuditPassword@123";
  const testName = "Audit Test User";
  const testPhone = "+91 9988776655";

  // Load route modules via jiti
  const signupRoute = loadModule("src/app/api/auth/signup/route.ts");
  const signinRoute = loadModule("src/app/api/auth/signin/route.ts");
  const googleRoute = loadModule("src/app/api/auth/google/route.ts");
  const otpSendRoute = loadModule("src/app/api/auth/otp/send/route.ts");
  const otpVerifyRoute = loadModule("src/app/api/auth/otp/verify/route.ts");
  const profileRoute = loadModule("src/app/api/auth/profile/route.ts");

  let createdUserId = null;

  // 1.1 Test New Customer Registration
  try {
    const req = createRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: { name: testName, email: testEmail, password: testPassword, phone: testPhone },
    });
    const res = await signupRoute.POST(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, "1.1 New customer registration succeeds with status 201");
    assert(data.user && data.user.email === testEmail, "1.1 Response contains newly registered user details");
    assert(data.token && typeof data.token === "string", "1.1 Response contains valid auth JWT token");

    createdUserId = data.user?.id;

    // Verify directly in Neon database
    const dbUser = await queryNeon(() => sql`SELECT * FROM users WHERE email = ${testEmail} LIMIT 1`);
    assert(dbUser.length > 0, "1.1 Newly registered user is stored in Neon PostgreSQL");
    assert(dbUser[0]?.id === createdUserId, "1.1 User ID in Neon matches API response");
    assert(bcrypt.compareSync(testPassword, dbUser[0]?.password_hash), "1.1 Password is securely hashed with bcrypt in Neon");
  } catch (err) {
    assert(false, "1.1 New customer registration", err.message);
  }

  // 1.2 Test Duplicate Registration Validation
  try {
    const reqDup = createRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: { name: testName, email: testEmail, password: testPassword },
    });
    const resDup = await signupRoute.POST(reqDup);
    const dataDup = await resDup.json();

    assert(resDup.status === 409 || resDup.status === 400, "1.2 Duplicate email registration returns error status (400/409)");
    assert(dataDup.success === false, "1.2 Duplicate email registration returns success: false");
  } catch (err) {
    assert(false, "1.2 Duplicate email registration", err.message);
  }

  // 1.3 Test Missing Fields Validation
  try {
    const reqInvalid = createRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: { email: `invalid-${timestamp}@test.com` },
    });
    const resInvalid = await signupRoute.POST(reqInvalid);
    const dataInvalid = await resInvalid.json();

    assert(resInvalid.status === 400 && dataInvalid.success === false, "1.3 Missing name/password returns 400 error");
  } catch (err) {
    assert(false, "1.3 Missing fields validation", err.message);
  }

  // 1.4 Test Existing Customer Login
  try {
    const reqLogin = createRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      body: { email: testEmail, password: testPassword },
    });
    const resLogin = await signinRoute.POST(reqLogin);
    const dataLogin = await resLogin.json();

    assert(resLogin.status === 200 && dataLogin.success === true, "1.4 Customer login with correct password returns 200");
    assert(dataLogin.token && dataLogin.user?.email === testEmail, "1.4 Customer login returns valid token and user info");
  } catch (err) {
    assert(false, "1.4 Customer login", err.message);
  }

  // 1.5 Test Incorrect Password
  try {
    const reqWrongPw = createRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      body: { email: testEmail, password: "WrongPassword!999" },
    });
    const resWrongPw = await signinRoute.POST(reqWrongPw);
    const dataWrongPw = await resWrongPw.json();

    assert(resWrongPw.status === 401 && dataWrongPw.success === false, "1.5 Incorrect password returns 401 Unauthorized");
  } catch (err) {
    assert(false, "1.5 Incorrect password", err.message);
  }

  // 1.6 Test Google Authentication (New & Existing User Upsert)
  const googleTestId = `google_sub_${timestamp}`;
  const googleEmail = `google.user.${timestamp}@gmail.com`;
  try {
    const reqGoogle = createRequest("http://localhost:3000/api/auth/google", {
      method: "POST",
      body: {
        credential: "mock-google-token-payload",
        googleId: googleTestId,
        email: googleEmail,
        name: "Google Audit User",
        picture: "https://lh3.googleusercontent.com/test-photo.jpg",
      },
    });
    const resGoogle = await googleRoute.POST(reqGoogle);
    const dataGoogle = await resGoogle.json();

    assert(resGoogle.status === 200 && dataGoogle.success === true, "1.6 Google OAuth login/upsert returns 200 OK");
    assert(dataGoogle.token && dataGoogle.user?.email === googleEmail, "1.6 Google OAuth returns token for user");

    // Verify directly in Neon
    const dbGoogle = await queryNeon(() => sql`SELECT * FROM users WHERE email = ${googleEmail} LIMIT 1`);
    assert(dbGoogle.length > 0, "1.6 Google user record is saved in Neon PostgreSQL");
    assert(dbGoogle[0]?.google_id === googleTestId, "1.6 Google sub/ID is recorded in Neon");
  } catch (err) {
    assert(false, "1.6 Google authentication", err.message);
  }

  // 1.7 Test Phone Authentication & OTP
  const otpPhone = "+919447446008";
  const cleanOtpPhone = otpPhone.replace(/\D/g, "").slice(-10);
  try {
    const reqSendOtp = createRequest("http://localhost:3000/api/auth/otp/send", {
      method: "POST",
      body: { phone: otpPhone },
    });
    const resSendOtp = await otpSendRoute.POST(reqSendOtp);
    const dataSendOtp = await resSendOtp.json();

    assert(resSendOtp.status === 200 && dataSendOtp.success === true, "1.7 OTP generation succeeds");

    // Fetch the OTP recorded in Neon phone_otps table
    const dbOtps = await queryNeon(() => sql`
      SELECT * FROM phone_otps WHERE phone = ${cleanOtpPhone} ORDER BY created_at DESC LIMIT 1
    `);
    assert(dbOtps.length > 0, "1.7 OTP record is saved in Neon phone_otps table");
    const generatedOtp = dbOtps[0]?.otp;
    assert(generatedOtp && generatedOtp.length >= 4, "1.7 Generated OTP is present in Neon");

    // Test verifying with WRONG OTP
    const reqBadOtp = createRequest("http://localhost:3000/api/auth/otp/verify", {
      method: "POST",
      body: { phone: otpPhone, otp: "000000" },
    });
    const resBadOtp = await otpVerifyRoute.POST(reqBadOtp);
    const dataBadOtp = await resBadOtp.json();
    assert(resBadOtp.status === 400 && dataBadOtp.success === false, "1.7 Verifying incorrect OTP returns 400 error");

    // Test verifying with CORRECT OTP
    const reqGoodOtp = createRequest("http://localhost:3000/api/auth/otp/verify", {
      method: "POST",
      body: { phone: otpPhone, otp: generatedOtp },
    });
    const resGoodOtp = await otpVerifyRoute.POST(reqGoodOtp);
    const dataGoodOtp = await resGoodOtp.json();
    assert(resGoodOtp.status === 200 && dataGoodOtp.success === true, "1.7 Verifying correct OTP succeeds and returns JWT");
  } catch (err) {
    assert(false, "1.7 Phone OTP authentication", err.message);
  }

  // 1.8 Test Profile Updates
  const updatedName = "Audit User Updated Name";
  const updatedPhone = "+91 9111222333";
  const userToken = createTestToken({ id: createdUserId, email: testEmail, name: testName, role: "customer" });

  try {
    const reqUpdateProfile = createRequest("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      token: userToken,
      body: { name: updatedName, phone: updatedPhone },
    });
    const resUpdateProfile = await profileRoute.PUT(reqUpdateProfile);
    const dataUpdateProfile = await resUpdateProfile.json();

    assert(resUpdateProfile.status === 200 && dataUpdateProfile.success === true, "1.8 Profile update returns 200");

    // Verify in Neon
    const dbUpdatedUser = await queryNeon(() => sql`SELECT * FROM users WHERE id = ${createdUserId}`);
    assert(dbUpdatedUser[0]?.name === updatedName, "1.8 Profile name update is persisted in Neon");
    assert(dbUpdatedUser[0]?.phone === updatedPhone, "1.8 Profile phone update is persisted in Neon");

    // Test GET /api/auth/profile
    const reqGetProfile = createRequest("http://localhost:3000/api/auth/profile", {
      method: "GET",
      token: userToken,
    });
    const resGetProfile = await profileRoute.GET(reqGetProfile);
    const dataGetProfile = await resGetProfile.json();
    assert(resGetProfile.status === 200 && dataGetProfile.user?.name === updatedName, "1.8 GET profile returns updated information");
  } catch (err) {
    assert(false, "1.8 Profile updates", err.message);
  }

  // 1.9 Test Password Updates
  const newPassword = "NewSecretPassword@456";
  try {
    const reqChangePw = createRequest("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      token: userToken,
      body: { currentPassword: testPassword, newPassword: newPassword },
    });
    const resChangePw = await profileRoute.PUT(reqChangePw);
    const dataChangePw = await resChangePw.json();

    assert(resChangePw.status === 200 && dataChangePw.success === true, "1.9 Password update succeeds");

    // Verify that login with new password works
    const reqLoginNew = createRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      body: { email: testEmail, password: newPassword },
    });
    const resLoginNew = await signinRoute.POST(reqLoginNew);
    assert(resLoginNew.status === 200, "1.9 Signin with newly updated password succeeds");

    // Verify that login with old password fails
    const reqLoginOld = createRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      body: { email: testEmail, password: testPassword },
    });
    const resLoginOld = await signinRoute.POST(reqLoginOld);
    assert(resLoginOld.status === 401, "1.9 Signin with old password fails (401)");
  } catch (err) {
    assert(false, "1.9 Password updates", err.message);
  }

  // Cleanup test users from Neon
  try {
    await queryNeon(() => sql`DELETE FROM users WHERE email = ${testEmail} OR email = ${googleEmail}`);
    await queryNeon(() => sql`DELETE FROM phone_otps WHERE phone = ${otpPhone}`);
    console.log("  [Cleanup] Test users and OTP records cleaned up from Neon.");
  } catch {}

  console.log(`\nSection 1 Results: ${results.passed.length} Passed, ${results.failed.length} Failed\n`);
  return results;
}

runAuthTests().catch(console.error);
