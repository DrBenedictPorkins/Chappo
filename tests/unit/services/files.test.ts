import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { FileService } from "../../../src/services/files";

// Mock getSignedUrl
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://signed-url.example.com"),
}));

const s3Mock = mockClient(S3Client);

describe("FileService", () => {
  let fileService: FileService;
  const bucketName = "test-bucket";

  beforeEach(() => {
    s3Mock.reset();
    vi.clearAllMocks();
    fileService = new FileService(bucketName);
  });

  describe("getUploadUrl", () => {
    it("should generate a presigned upload URL", async () => {
      const key = "uploads/test-file.txt";
      const contentType = "text/plain";

      const url = await fileService.getUploadUrl(key, contentType);

      expect(url).toBe("https://signed-url.example.com");
    });

    it("should use default expiration time", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      await fileService.getUploadUrl("test.txt", "text/plain");

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 3600 }
      );
    });

    it("should use custom expiration time", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      await fileService.getUploadUrl("test.txt", "text/plain", 7200);

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 7200 }
      );
    });
  });

  describe("getDownloadUrl", () => {
    it("should generate a presigned download URL", async () => {
      const key = "uploads/test-file.txt";

      const url = await fileService.getDownloadUrl(key);

      expect(url).toBe("https://signed-url.example.com");
    });

    it("should use default expiration time", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      await fileService.getDownloadUrl("test.txt");

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 3600 }
      );
    });

    it("should use custom expiration time", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      await fileService.getDownloadUrl("test.txt", 1800);

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 1800 }
      );
    });
  });
});
