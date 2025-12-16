import type { ApiResponse } from "../types";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function success<T>(data: T): ApiResponse<T> {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers,
  };
}

export function created<T>(data: T): ApiResponse<T> {
  return {
    statusCode: 201,
    body: JSON.stringify(data),
    headers,
  };
}

export function noContent(): ApiResponse {
  return {
    statusCode: 204,
    body: "",
    headers,
  };
}

export function badRequest(message: string): ApiResponse {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
    headers,
  };
}

export function notFound(message: string = "Resource not found"): ApiResponse {
  return {
    statusCode: 404,
    body: JSON.stringify({ error: message }),
    headers,
  };
}

export function serverError(
  message: string = "Internal server error"
): ApiResponse {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: message }),
    headers,
  };
}
