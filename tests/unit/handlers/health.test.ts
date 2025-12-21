import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "../../../src/handlers/health";

describe("Health handler", () => {
  const mockEvent = {} as APIGatewayProxyEventV2;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:30:00.000Z"));
  });

  it("should return healthy status", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body as string);
    expect(body.status).toBe("healthy");
    expect(body.timestamp).toBe("2024-01-15T10:30:00.000Z");
    expect(body.version).toBeDefined();
  });

  it("should include CORS headers", async () => {
    const response = await handler(mockEvent);

    expect(response.headers).toEqual({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });
  });
});
