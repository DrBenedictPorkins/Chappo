import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { UserService } from "../../services/users";
import { created, badRequest, serverError } from "../../utils/response";
import type { CreateUserInput } from "../../types";

const userService = new UserService(Resource.UsersTable.name);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    if (!event.body) {
      return badRequest("Request body is required");
    }

    const input: CreateUserInput = JSON.parse(event.body);

    if (!input.email || !input.name) {
      return badRequest("Email and name are required");
    }

    if (!isValidEmail(input.email)) {
      return badRequest("Invalid email format");
    }

    const user = await userService.create(input);
    return created({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    return serverError();
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
