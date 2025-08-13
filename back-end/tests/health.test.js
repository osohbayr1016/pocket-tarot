const request = require("supertest");
const app = require("../server"); // Make sure server.js exports the app

describe("Health Check", () => {
  it("should return status OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});
