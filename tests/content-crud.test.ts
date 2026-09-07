import request from "supertest";
import app from "../src/app";
import DBMethods from "../src/db";
import { seedUser, uniqueTenant } from "./helpers";

// Food is exercised as the representative "plain" content type - it goes
// through createContentController with no afterRetrieve/validate hooks,
// same as Drinks. Events (which uses both hooks) gets its own suite.
const PASSWORD = "correct-horse-battery-staple";

const VALID_FOOD = {
  Name: "Nachos",
  Description: "Loaded with everything",
  Cost: 12.5,
  Sale: { Is: false, Percentage: 0 },
  IsSpecial: false,
  Tags: { Spicy: true, Raw: false, Allergens: true },
  Type: "Appetizer",
  Ingredients: "Chips, cheese, jalapenos",
};

async function loggedInAgent() {
  const tenant = uniqueTenant("food-crud");
  await seedUser(tenant, PASSWORD);
  const agent = request.agent(app);
  await agent.post("/user/login").send({ username: tenant, password: PASSWORD });
  return agent;
}

beforeAll(async () => {
  await DBMethods.connect();
});

describe("food CRUD", () => {
  it("returns an empty array, not a string or [{}], when nothing exists yet", async () => {
    const agent = await loggedInAgent();
    const res = await agent.get("/food");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: false, response: [] });
  });

  it("rejects a create with no Data", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/food").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("runs a full create -> read -> update -> delete cycle", async () => {
    const agent = await loggedInAgent();

    const createRes = await agent.post("/food").send({ Data: VALID_FOOD });
    expect(createRes.status).toBe(200);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.response.data).toHaveLength(1);
    const created = createRes.body.response.data[0];
    expect(created.Name).toBe("Nachos");

    const listRes = await agent.get("/food");
    expect(listRes.body.response).toHaveLength(1);

    const updateRes = await agent
      .put(`/food/${created._id}`)
      .send({ Data: { ...VALID_FOOD, Name: "Loaded Nachos", Cost: 14 } });
    expect(updateRes.status).toBe(200);
    const updated = updateRes.body.response.data[0];
    expect(updated.Name).toBe("Loaded Nachos");
    expect(updated.Cost).toBe(14);

    const deleteRes = await agent.delete(`/food/${created._id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.response.data).toEqual([]);

    const finalList = await agent.get("/food");
    expect(finalList.body).toEqual({ success: false, response: [] });
  });

  it("404s updating an id that doesn't exist", async () => {
    const agent = await loggedInAgent();
    const res = await agent
      .put("/food/64b64b64b64b64b64b64b64b")
      .send({ Data: VALID_FOOD });
    expect(res.status).toBe(404);
  });

  it("keeps tenants' food lists isolated from one another", async () => {
    const agentA = await loggedInAgent();
    const agentB = await loggedInAgent();

    await agentA.post("/food").send({ Data: VALID_FOOD });

    const listA = await agentA.get("/food");
    const listB = await agentB.get("/food");
    expect(listA.body.response).toHaveLength(1);
    expect(listB.body).toEqual({ success: false, response: [] });
  });
});
