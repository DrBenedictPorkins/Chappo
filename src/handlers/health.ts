import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { success } from "../utils/response";

export async function handler(
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return success({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
}
