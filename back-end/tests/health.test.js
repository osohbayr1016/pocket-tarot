const request = require("supertest");
const app = require("../server");

describe("Backend retired safely", () => {
  it("returns an explicit stateless health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({status:"OK", backend:"deprecated"});
    expect(res.headers["cache-control"]).toContain("no-store");
  });
  for (const route of ["/api/ai/test","/api/ai/horoscope","/api/auth/login","/api/readings","/api/dreams/interpret"]) {
    it("fails closed: " + route, async () => {
      const res = await request(app).get(route);
      expect(res.statusCode).toBe(410);
      expect(JSON.stringify(res.body)).not.toMatch(/apiKeyStartsWith|apiKeyLength|DATABASE_URL/);
    });
  }
});
