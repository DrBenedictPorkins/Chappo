import type { SQSEvent, SQSHandler } from "aws-lambda";
import type { QueueMessage } from "../../types";

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const message: QueueMessage = JSON.parse(record.body);
      await processMessage(message);
      console.log(`Successfully processed message: ${record.messageId}`);
    } catch (error) {
      console.error(`Error processing message ${record.messageId}:`, error);
      throw error; // Re-throw to trigger retry
    }
  }
};

async function processMessage(message: QueueMessage): Promise<void> {
  console.log(`Processing message type: ${message.type}`);

  switch (message.type) {
    case "USER_CREATED":
      await handleUserCreated(message.payload);
      break;
    case "FILE_UPLOADED":
      await handleFileUploaded(message.payload);
      break;
    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
}

async function handleUserCreated(
  payload: Record<string, unknown>
): Promise<void> {
  console.log("Handling user created event:", payload);
  // Add your business logic here (e.g., send welcome email)
}

async function handleFileUploaded(
  payload: Record<string, unknown>
): Promise<void> {
  console.log("Handling file uploaded event:", payload);
  // Add your business logic here (e.g., process file, generate thumbnails)
}
