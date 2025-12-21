# Chappo

AWS serverless API project built with SST v3 and TypeScript.

## Features

- **Users API** - Full CRUD operations with DynamoDB
- **Files API** - S3 presigned URL generation for uploads/downloads
- **Queue Processing** - SQS-based async message processing
- **Type-safe** - Full TypeScript with SST resource linking

## Project Structure

```
├── src/
│   ├── handlers/          # Lambda function handlers
│   │   ├── health.ts      # Health check endpoint
│   │   ├── users/         # Users CRUD handlers
│   │   ├── files/         # File upload/download handlers
│   │   └── queue/         # SQS message processor
│   ├── services/          # Business logic & AWS clients
│   │   ├── users.ts       # DynamoDB user operations
│   │   └── files.ts       # S3 file operations
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utilities
├── tests/
│   └── unit/              # Unit tests with Vitest
├── sst.config.ts          # SST infrastructure config
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| POST | `/files/upload-url` | Get presigned upload URL |
| GET | `/files/{key}/download-url` | Get presigned download URL |

## Getting Started

### Prerequisites

- Node.js 18+
- AWS CLI configured with credentials
- pnpm/npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
# Start local development with live reload
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Deployment

```bash
# Deploy to AWS
npm run deploy

# Deploy to specific stage
npx sst deploy --stage production

# Remove all resources
npm run remove
```

## AWS Resources

The project creates the following AWS resources:

- **API Gateway** - HTTP API with routes
- **Lambda Functions** - Handlers for each endpoint
- **DynamoDB Table** - User data storage
- **S3 Bucket** - File storage
- **SQS Queue** - Async message processing

## Configuration

SST uses code-based configuration in `sst.config.ts`. Resources are automatically:

- Named with your app and stage prefix
- Linked to Lambda functions for type-safe access
- Cleaned up on `sst remove` (except in production)
