export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

export interface QueueMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
