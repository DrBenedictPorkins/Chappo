import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { UserService } from "../../services/users";
import { noContent, notFound, badRequest, serverError } from "../../utils/response";

const userService = new UserService(Resource.UsersTable.name);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return badRequest("User ID is required");
    }

    const deleted = await userService.delete(id);

    if (!deleted) {
      return notFound("User not found");
    }

    return noContent();
  } catch (error) {
    console.error("Error deleting user:", error);
    return serverError();
  }
}
