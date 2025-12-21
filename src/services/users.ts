import {
  DynamoDBClient,
  DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { User, CreateUserInput, UpdateUserInput } from "../types";

export class UserService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, config?: DynamoDBClientConfig) {
    const client = new DynamoDBClient(config ?? {});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const user: User = {
      id,
      email: input.email,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: `USER#${id}`,
          sk: `USER#${id}`,
          ...user,
        },
        ConditionExpression: "attribute_not_exists(pk)",
      })
    );

    return user;
  }

  async get(id: string): Promise<User | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `USER#${id}`,
          sk: `USER#${id}`,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return {
      id: result.Item.id,
      email: result.Item.email,
      name: result.Item.name,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,
    };
  }

  async list(): Promise<User[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "begins_with(pk, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": "USER#",
        },
      })
    );

    return (result.Items ?? []).map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const existing = await this.get(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const updates: string[] = ["#updatedAt = :updatedAt"];
    const names: Record<string, string> = { "#updatedAt": "updatedAt" };
    const values: Record<string, string> = { ":updatedAt": now };

    if (input.email !== undefined) {
      updates.push("#email = :email");
      names["#email"] = "email";
      values[":email"] = input.email;
    }

    if (input.name !== undefined) {
      updates.push("#name = :name");
      names["#name"] = "name";
      values[":name"] = input.name;
    }

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          pk: `USER#${id}`,
          sk: `USER#${id}`,
        },
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      })
    );

    return this.get(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) {
      return false;
    }

    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `USER#${id}`,
          sk: `USER#${id}`,
        },
      })
    );

    return true;
  }
}
