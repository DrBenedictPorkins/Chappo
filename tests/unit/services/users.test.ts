import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserService } from "../../../src/services/users";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("UserService", () => {
  let userService: UserService;
  const tableName = "test-users-table";

  beforeEach(() => {
    ddbMock.reset();
    userService = new UserService(tableName);
  });

  describe("create", () => {
    it("should create a new user", async () => {
      ddbMock.on(PutCommand).resolves({});

      const input = { email: "test@example.com", name: "Test User" };
      const user = await userService.create(input);

      expect(user.email).toBe(input.email);
      expect(user.name).toBe(input.name);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      const putCall = ddbMock.commandCalls(PutCommand)[0];
      expect(putCall?.args[0].input.TableName).toBe(tableName);
      expect(putCall?.args[0].input.Item?.email).toBe(input.email);
    });

    it("should generate unique IDs for each user", async () => {
      ddbMock.on(PutCommand).resolves({});

      const input = { email: "test@example.com", name: "Test User" };
      const user1 = await userService.create(input);
      const user2 = await userService.create(input);

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe("get", () => {
    it("should return a user when found", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      ddbMock.on(GetCommand).resolves({ Item: mockUser });

      const user = await userService.get("123");

      expect(user).toEqual(mockUser);

      const getCall = ddbMock.commandCalls(GetCommand)[0];
      expect(getCall?.args[0].input.TableName).toBe(tableName);
      expect(getCall?.args[0].input.Key).toEqual({
        pk: "USER#123",
        sk: "USER#123",
      });
    });

    it("should return null when user not found", async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const user = await userService.get("nonexistent");

      expect(user).toBeNull();
    });
  });

  describe("list", () => {
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ];

      ddbMock.on(QueryCommand).resolves({ Items: mockUsers });

      const users = await userService.list();

      expect(users).toHaveLength(2);
      expect(users[0]?.email).toBe("user1@example.com");
      expect(users[1]?.email).toBe("user2@example.com");
    });

    it("should return empty array when no users exist", async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const users = await userService.list();

      expect(users).toEqual([]);
    });

    it("should handle undefined Items", async () => {
      ddbMock.on(QueryCommand).resolves({ Items: undefined });

      const users = await userService.list();

      expect(users).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update user email", async () => {
      const existingUser = {
        id: "123",
        email: "old@example.com",
        name: "Test User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const updatedUser = {
        ...existingUser,
        email: "new@example.com",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      ddbMock.on(GetCommand).resolvesOnce({ Item: existingUser }).resolvesOnce({ Item: updatedUser });
      ddbMock.on(UpdateCommand).resolves({});

      const result = await userService.update("123", { email: "new@example.com" });

      expect(result?.email).toBe("new@example.com");

      const updateCall = ddbMock.commandCalls(UpdateCommand)[0];
      expect(updateCall?.args[0].input.ExpressionAttributeValues?.[":email"]).toBe("new@example.com");
    });

    it("should update user name", async () => {
      const existingUser = {
        id: "123",
        email: "test@example.com",
        name: "Old Name",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const updatedUser = {
        ...existingUser,
        name: "New Name",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      ddbMock.on(GetCommand).resolvesOnce({ Item: existingUser }).resolvesOnce({ Item: updatedUser });
      ddbMock.on(UpdateCommand).resolves({});

      const result = await userService.update("123", { name: "New Name" });

      expect(result?.name).toBe("New Name");
    });

    it("should return null when updating non-existent user", async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const result = await userService.update("nonexistent", { name: "New Name" });

      expect(result).toBeNull();
      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("should delete existing user", async () => {
      const existingUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      ddbMock.on(GetCommand).resolves({ Item: existingUser });
      ddbMock.on(DeleteCommand).resolves({});

      const result = await userService.delete("123");

      expect(result).toBe(true);

      const deleteCall = ddbMock.commandCalls(DeleteCommand)[0];
      expect(deleteCall?.args[0].input.Key).toEqual({
        pk: "USER#123",
        sk: "USER#123",
      });
    });

    it("should return false when deleting non-existent user", async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const result = await userService.delete("nonexistent");

      expect(result).toBe(false);
      expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(0);
    });
  });
});
