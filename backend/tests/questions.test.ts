import request from "supertest";
import app from "../src/app";

jest.mock("../src/middlewares/auth", () => ({
  authRequired: (req: any, res: any, next: any) => next(),
}));

process.env.NODE_ENV = "test";

describe("Questions API", () => {
  it("GET /api/questions doit retourner 200", async () => {
    const res = await request(app).get("/api/questions");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});