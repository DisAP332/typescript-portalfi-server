import request from "supertest";
import app from "../src/app";
import DBMethods from "../src/db";
import { getEventModel } from "../src/content-types/events";
import { seedUser, uniqueTenant } from "./helpers";

// Events is the one content type that uses both optional hooks on
// createContentController: validate (reject past dates) and afterRetrieve
// (silently delete past events on the next read). Food/Drinks are covered
// by content-crud.test.ts and use neither.
const PASSWORD = "correct-horse-battery-staple";

function futureDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function pastDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

async function loggedInAgent() {
  const tenant = uniqueTenant("events-crud");
  await seedUser(tenant, PASSWORD);
  const agent = request.agent(app);
  await agent.post("/user/login").send({ username: tenant, password: PASSWORD });
  return { agent, tenant };
}

beforeAll(async () => {
  await DBMethods.connect();
});

describe("event validation", () => {
  it("returns a clean 400 (not an uncaught 500) when Date is missing", async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.post("/events").send({
      Data: { Name: "No Date", Time: "19:00", Description: "x", Cost: "0" },
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a create with a past date as a well-formed 200, not a 400", async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.post("/events").send({
      Data: {
        Date: pastDate(),
        Name: "Old Trivia Night",
        Time: "19:00",
        Description: "already happened",
        Cost: "0",
      },
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: false,
      response: "Dates cannot be set in the past.",
    });
  });

  it("accepts a future-dated event", async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.post("/events").send({
      Data: {
        Date: futureDate(),
        Name: "Trivia Night",
        Time: "19:00",
        Description: "win prizes",
        Cost: "0",
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response.data).toHaveLength(1);
  });

  it("also rejects a past date on update", async () => {
    const { agent } = await loggedInAgent();
    const createRes = await agent.post("/events").send({
      Data: {
        Date: futureDate(),
        Name: "Trivia Night",
        Time: "19:00",
        Description: "win prizes",
        Cost: "0",
      },
    });
    const id = createRes.body.response.data[0]._id;

    const res = await agent.put(`/events/${id}`).send({
      Data: {
        Date: pastDate(),
        Name: "Trivia Night",
        Time: "19:00",
        Description: "win prizes",
        Cost: "0",
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
  });
});

describe("event afterRetrieve", () => {
  it("filters out and deletes a past event on the next read, keeps future ones", async () => {
    const { agent, tenant } = await loggedInAgent();

    // inserted directly, bypassing the validate hook - this is the state a
    // once-future event settles into after time passes, which the API
    // itself can never produce through create/update.
    const Model = getEventModel(DBMethods.getConnection(tenant));
    const stale = await Model.create({
      Date: pastDate(),
      Name: "Stale Event",
      Time: "19:00",
      Description: "should be swept",
      Cost: "0",
    });
    await agent.post("/events").send({
      Data: {
        Date: futureDate(),
        Name: "Upcoming Event",
        Time: "19:00",
        Description: "should survive",
        Cost: "0",
      },
    });

    const res = await agent.get("/events");
    expect(res.body.response).toHaveLength(1);
    expect(res.body.response[0].Name).toBe("Upcoming Event");

    const stillInDb = await Model.findById(stale._id);
    expect(stillInDb).toBeNull();
  });
});
