import request from "supertest";
import app from "../src/app";

jest.mock("../src/middlewares/auth", () => ({
  authRequired: (req: any, res: any, next: any) => next(),
}));

process.env.NODE_ENV = "test";

describe("Routes Questions", () => {
  it("GET /api/questions should return 200", async () => {
    const response = await request(app).get("/api/questions");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});