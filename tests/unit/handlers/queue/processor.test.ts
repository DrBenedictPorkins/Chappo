import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "../../../../src/handlers/queue/processor";

describe("Queue processor handler", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const createSQSEvent = (records: Partial<SQSRecord>[]): SQSEvent => ({
    Records: records.map((record, index) => ({
      messageId: record.messageId || `msg-${index}`,
      receiptHandle: record.receiptHandle || `receipt-${index}`,
      body: record.body || "{}",
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1234567890",
        SenderId: "sender-id",
        ApproximateFirstReceiveTimestamp: "1234567890",
      },
      messageAttributes: {},
      md5OfBody: "abc123",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:test-queue",
      awsRegion: "us-east-1",
      ...record,
    })) as SQSRecord[],
  });

  it("should process USER_CREATED message", async () => {
    const event = createSQSEvent([
      {
        body: JSON.stringify({
          type: "USER_CREATED",
          payload: { userId: "123", email: "test@example.com" },
          timestamp: "2024-01-15T10:30:00.000Z",
        }),
      },
    ]);

    await handler(event, {} as any, () => {});

    expect(console.log).toHaveBeenCalledWith(
      "Processing message type: USER_CREATED"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Handling user created event:",
      { userId: "123", email: "test@example.com" }
    );
  });

  it("should process FILE_UPLOADED message", async () => {
    const event = createSQSEvent([
      {
        body: JSON.stringify({
          type: "FILE_UPLOADED",
          payload: { key: "uploads/test.txt", size: 1024 },
          timestamp: "2024-01-15T10:30:00.000Z",
        }),
      },
    ]);

    await handler(event, {} as any, () => {});

    expect(console.log).toHaveBeenCalledWith(
      "Processing message type: FILE_UPLOADED"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Handling file uploaded event:",
      { key: "uploads/test.txt", size: 1024 }
    );
  });

  it("should warn on unknown message type", async () => {
    const event = createSQSEvent([
      {
        body: JSON.stringify({
          type: "UNKNOWN_TYPE",
          payload: {},
          timestamp: "2024-01-15T10:30:00.000Z",
        }),
      },
    ]);

    await handler(event, {} as any, () => {});

    expect(console.warn).toHaveBeenCalledWith(
      "Unknown message type: UNKNOWN_TYPE"
    );
  });

  it("should process multiple messages", async () => {
    const event = createSQSEvent([
      {
        messageId: "msg-1",
        body: JSON.stringify({
          type: "USER_CREATED",
          payload: { userId: "1" },
          timestamp: "2024-01-15T10:30:00.000Z",
        }),
      },
      {
        messageId: "msg-2",
        body: JSON.stringify({
          type: "FILE_UPLOADED",
          payload: { key: "test.txt" },
          timestamp: "2024-01-15T10:30:00.000Z",
        }),
      },
    ]);

    await handler(event, {} as any, () => {});

    expect(console.log).toHaveBeenCalledWith(
      "Successfully processed message: msg-1"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Successfully processed message: msg-2"
    );
  });

  it("should throw error on invalid JSON", async () => {
    const event = createSQSEvent([
      {
        body: "invalid json",
      },
    ]);

    await expect(handler(event, {} as any, () => {})).rejects.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
