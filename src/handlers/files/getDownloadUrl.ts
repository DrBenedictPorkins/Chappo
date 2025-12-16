import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { FileService } from "../../services/files";
import { success, badRequest, serverError } from "../../utils/response";

const fileService = new FileService(Resource.FilesBucket.name);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const key = event.pathParameters?.key;

    if (!key) {
      return badRequest("File key is required");
    }

    const decodedKey = decodeURIComponent(key);
    const downloadUrl = await fileService.getDownloadUrl(decodedKey);

    return success({
      downloadUrl,
      key: decodedKey,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return serverError();
  }
}
