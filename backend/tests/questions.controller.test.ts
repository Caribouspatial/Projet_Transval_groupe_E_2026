import request from "supertest";
import app from "../src/app";

process.env.NODE_ENV = "test";

describe("Questions Controller via API", () => {
  it("GET /api/questions retourne 200", async () => {
    const res = await request(app).get("/api/questions");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});