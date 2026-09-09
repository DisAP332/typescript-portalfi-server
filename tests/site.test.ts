import request from "supertest";
import app from "../src/app";
import DBMethods from "../src/db";
import { seedUser, uniqueTenant } from "./helpers";

// /site has two audiences: the venue's own dashboard (authenticated) and
// its separate public-facing website (no session - identifies itself by
// tenant in the URL instead). See src/site/siteRouter.ts.
const PASSWORD = "correct-horse-battery-staple";

const VALID_SITE_DATA = {
  Events: [],
  Drinks: { cocktails: [], seltzers: [], drafts: [], beers: [] },
};

beforeAll(async () => {
  await DBMethods.connect();
});

describe("/site auth boundary", () => {
  it("requires a session to read the dashboard's own /site route", async () => {
    const res = await request(app).get("/site");
    expect(res.status).toBe(401);
  });

  it("requires a session to publish", async () => {
    const res = await request(app).post("/site").send({ Data: VALID_SITE_DATA });
    expect(res.status).toBe(401);
  });

  it("serves the public route with no session at all", async () => {
    const tenant = uniqueTenant("site-public");
    await seedUser(tenant, PASSWORD);
    const agent = request.agent(app);
    await agent.post("/user/login").send({ username: tenant, password: PASSWORD });
    await agent.post("/site").send({ Data: VALID_SITE_DATA });

    const res = await request(app).get(`/site/public/${tenant}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("keeps each tenant's public data isolated", async () => {
    const tenant = uniqueTenant("site-public-isolated");
    const res = await request(app).get(`/site/public/${tenant}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
