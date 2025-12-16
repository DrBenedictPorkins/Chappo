import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Resource } from "sst";
import { FileService } from "../../services/files";
import { success, badRequest, serverError } from "../../utils/response";

const fileService = new FileService(Resource.FilesBucket.name);

interface UploadUrlRequest {
  filename: string;
  contentType: string;
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    if (!event.body) {
      return badRequest("Request body is required");
    }

    const input: UploadUrlRequest = JSON.parse(event.body);

    if (!input.filename || !input.contentType) {
      return badRequest("Filename and contentType are required");
    }

    const key = `uploads/${Date.now()}-${input.filename}`;
    const uploadUrl = await fileService.getUploadUrl(key, input.contentType);

    return success({
      uploadUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return serverError();
  }
}
