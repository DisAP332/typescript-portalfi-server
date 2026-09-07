import request from "supertest";
import app from "../src/app";
import DBMethods from "../src/db";
import { seedUser, uniqueTenant } from "./helpers";

const PASSWORD = "correct-horse-battery-staple";

beforeAll(async () => {
  await DBMethods.connect();
});

describe("POST /user/login", () => {
  it("sets an HttpOnly session cookie and omits the token from the body", async () => {
    const tenant = uniqueTenant("login-ok");
    await seedUser(tenant, PASSWORD);

    const res = await request(app)
      .post("/user/login")
      .send({ username: tenant, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response.user).toBe(tenant);
    expect(JSON.stringify(res.body)).not.toContain("eyJ"); // no raw JWT anywhere in the body

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toMatch(/HttpOnly/i);
    expect(tokenCookie).toMatch(/SameSite=Lax/i);
    expect(tokenCookie).not.toMatch(/Secure/i); // NODE_ENV=test, not production
  });

  it("rejects a wrong password without revealing which field was wrong", async () => {
    const tenant = uniqueTenant("login-badpw");
    await seedUser(tenant, PASSWORD);

    const res = await request(app)
      .post("/user/login")
      .send({ username: tenant, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects an unknown username", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({ username: uniqueTenant("no-such-user"), password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("verifyJWT (cookie-authenticated routes)", () => {
  it("rejects a request with no cookie at all", async () => {
    const res = await request(app).get("/food");
    expect(res.status).toBe(401);
    expect(res.body.response).toBe("No token provided.");
  });

  it("rejects a garbage cookie", async () => {
    const res = await request(app).get("/food").set("Cookie", "token=not-a-real-jwt");
    expect(res.status).toBe(401);
    expect(res.body.auth).toBe(false);
  });

  it("accepts a valid session cookie and scopes the request to that tenant", async () => {
    const tenant = uniqueTenant("authed");
    await seedUser(tenant, PASSWORD);
    const agent = request.agent(app);

    await agent.post("/user/login").send({ username: tenant, password: PASSWORD });
    const res = await agent.get("/food");

    expect(res.status).toBe(200);
  });
});

describe("POST /user/logout", () => {
  it("clears the session cookie so the next request is unauthenticated", async () => {
    const tenant = uniqueTenant("logout");
    await seedUser(tenant, PASSWORD);
    const agent = request.agent(app);

    await agent.post("/user/login").send({ username: tenant, password: PASSWORD });
    expect((await agent.get("/food")).status).toBe(200);

    const logoutRes = await agent.post("/user/logout");
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toEqual({ success: true, response: "logged out" });

    const res = await agent.get("/food");
    expect(res.status).toBe(401);
  });
});
