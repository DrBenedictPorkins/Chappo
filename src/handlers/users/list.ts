import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { UserService } from "../../services/users";
import { success, serverError } from "../../utils/response";

const userService = new UserService(Resource.UsersTable.name);

export async function handler(
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const users = await userService.list();
    return success({ users });
  } catch (error) {
    console.error("Error listing users:", error);
    return serverError();
  }
}
