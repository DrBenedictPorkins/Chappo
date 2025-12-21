/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "chappo",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // DynamoDB Table for Users
    const usersTable = new sst.aws.Dynamo("UsersTable", {
      fields: {
        pk: "string",
        sk: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    // S3 Bucket for file storage
    const bucket = new sst.aws.Bucket("FilesBucket");

    // SQS Queue for async processing
    const queue = new sst.aws.Queue("ProcessingQueue");

    // API Gateway
    const api = new sst.aws.ApiGatewayV2("Api");

    // Health check endpoint
    api.route("GET /health", {
      handler: "src/handlers/health.handler",
    });

    // Users API endpoints
    api.route("GET /users", {
      handler: "src/handlers/users/list.handler",
      link: [usersTable],
    });

    api.route("GET /users/{id}", {
      handler: "src/handlers/users/get.handler",
      link: [usersTable],
    });

    api.route("POST /users", {
      handler: "src/handlers/users/create.handler",
      link: [usersTable],
    });

    api.route("PUT /users/{id}", {
      handler: "src/handlers/users/update.handler",
      link: [usersTable],
    });

    api.route("DELETE /users/{id}", {
      handler: "src/handlers/users/delete.handler",
      link: [usersTable],
    });

    // Files API endpoints
    api.route("POST /files/upload-url", {
      handler: "src/handlers/files/getUploadUrl.handler",
      link: [bucket],
    });

    api.route("GET /files/{key}/download-url", {
      handler: "src/handlers/files/getDownloadUrl.handler",
      link: [bucket],
    });

    // Queue processor
    queue.subscribe("src/handlers/queue/processor.handler");

    return {
      api: api.url,
      bucket: bucket.name,
      queue: queue.url,
      usersTable: usersTable.name,
    };
  },
});
