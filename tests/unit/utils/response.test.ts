import { describe, it, expect } from "vitest";
import {
  success,
  created,
  noContent,
  badRequest,
  notFound,
  serverError,
} from "../../../src/utils/response";

describe("Response utilities", () => {
  const expectedHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  describe("success", () => {
    it("should return 200 status with data", () => {
      const data = { message: "Hello" };
      const response = success(data);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(data);
      expect(response.headers).toEqual(expectedHeaders);
    });

    it("should handle array data", () => {
      const data = [1, 2, 3];
      const response = success(data);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(data);
    });

    it("should handle nested objects", () => {
      const data = { user: { name: "John", email: "john@example.com" } };
      const response = success(data);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(data);
    });
  });

  describe("created", () => {
    it("should return 201 status with data", () => {
      const data = { id: "123", name: "New Resource" };
      const response = created(data);

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(data);
      expect(response.headers).toEqual(expectedHeaders);
    });
  });

  describe("noContent", () => {
    it("should return 204 status with empty body", () => {
      const response = noContent();

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");
      expect(response.headers).toEqual(expectedHeaders);
    });
  });

  describe("badRequest", () => {
    it("should return 400 status with error message", () => {
      const message = "Invalid input";
      const response = badRequest(message);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ error: message });
      expect(response.headers).toEqual(expectedHeaders);
    });
  });

  describe("notFound", () => {
    it("should return 404 status with default message", () => {
      const response = notFound();

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: "Resource not found" });
      expect(response.headers).toEqual(expectedHeaders);
    });

    it("should return 404 status with custom message", () => {
      const message = "User not found";
      const response = notFound(message);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: message });
    });
  });

  describe("serverError", () => {
    it("should return 500 status with default message", () => {
      const response = serverError();

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ error: "Internal server error" });
      expect(response.headers).toEqual(expectedHeaders);
    });

    it("should return 500 status with custom message", () => {
      const message = "Database connection failed";
      const response = serverError(message);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ error: message });
    });
  });
});
