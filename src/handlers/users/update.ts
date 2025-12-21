import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { UserService } from "../../services/users";
import { success, notFound, badRequest, serverError } from "../../utils/response";
import type { UpdateUserInput } from "../../types";

const userService = new UserService(Resource.UsersTable.name);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return badRequest("User ID is required");
    }

    if (!event.body) {
      return badRequest("Request body is required");
    }

    const input: UpdateUserInput = JSON.parse(event.body);

    if (input.email !== undefined && !isValidEmail(input.email)) {
      return badRequest("Invalid email format");
    }

    const user = await userService.update(id, input);

    if (!user) {
      return notFound("User not found");
    }

    return success({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return serverError();
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
