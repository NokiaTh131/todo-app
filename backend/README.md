# Todo App API Documentation

## Base URL(Can be change)
```
http://localhost:3000
```

## Authentication
All endpoints use JWT authentication via HTTP-only cookies. After login, the JWT token is automatically set as a cookie and included in subsequent requests.

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /user/register
Content-Type: application/json

{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```
**Response:** Sets HTTP-only cookie with JWT token for authentication

### Logout
```http
POST /auth/logout
```
**Response:** Clears authentication cookie

---

## User Endpoints

### Get Profile
```http
GET /users/profile
```
**Note:** Requires authentication cookie from login

---

## Board Endpoints

### Create Board
```http
POST /boards
Content-Type: application/json

{
  "name": "string",
  "description": "string" (optional),
  "background_color": "string" (optional, default: "#ffffff")
}
```

### Get User's Boards
```http
GET /boards
```

### Get Single Board
```http
GET /board/:id
```

### Update Board
```http
PATCH /board/:id
Content-Type: application/json

{
  "name": "string" (optional),
  "description": "string" (optional),
  "background_color": "string" (optional)
}
```

### Delete Board
```http
DELETE /board/:id
```
**Response:** `{ "message": "Board removed successfully" }`

---

## List Endpoints

### Create List in Board
```http
POST /lists/board/:boardId
Content-Type: application/json

{
  "name": "string",
  "position": "number" (optional, auto-assigns if not provided)
}
```

### Get Lists for Board
```http
GET /lists/board/:boardId
```
**Response:** Lists ordered by position (ascending) with their cards

### Get Single List
```http
GET /lists/:id
```
**Response:** List with its cards

### Update List
```http
PATCH /lists/:id
Content-Type: application/json

{
  "name": "string" (optional),
  "position": "number" (optional)
}
```

### Delete List
```http
DELETE /lists/:id
```
**Response:** `{ "message": "List removed successfully" }`

---

## Card Endpoints

### Create Card in List
```http
POST /cards/list/:listId
Content-Type: application/json

{
  "title": "string",
  "description": "string" (optional),
  "position": "number" (optional, auto-assigns if not provided),
  "due_date": "string" (optional, ISO date format),
  "cover_color": "string" (optional, default: "#ffffff")
}
```

### Get Cards for List
```http
GET /cards/list/:listId
```
**Response:** Cards ordered by position (ascending)

### Get Single Card
```http
GET /cards/:id
```

### Update Card
```http
PATCH /cards/:id
Content-Type: application/json

{
  "title": "string" (optional),
  "description": "string" (optional),
  "position": "number" (optional),
  "due_date": "string" (optional, ISO date format),
  "cover_color": "string" (optional)
  "list_id": "string" (optional)
}
```

### Delete Card
```http
DELETE /cards/:id
```
**Response:** `{ "message": "Card removed successfully" }`

---

## 📊 Data Models

### User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Board
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "background_color": "string",
  "user_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### List
```json
{
  "id": "string",
  "name": "string",
  "position": "number",
  "board_id": "string",
  "created_at": "timestamp",
  "cards": "Card[]" (when included)
}
```

### Card
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "position": "number",
  "due_date": "timestamp",
  "cover_color": "string",
  "list_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Important Notes

### Position Management
- **Unique Constraints:** Each list must have unique position within a board, each card must have unique position within a list
- **Auto-positioning:** If position not provided, items are added to the end
- **Manual positioning:** If position is provided, it must be unique or will result in constraint error
- **Frontend Responsibility:** Frontend should handle position reordering and gap management

### Date Format
Use ISO 8601 format for dates: `"2024-12-31T23:59:59.000Z"`

### Cascade Deletes
- Deleting a user → deletes all their boards → deletes all lists → deletes all cards
- Deleting a board → deletes all its lists → deletes all cards in those lists
- Deleting a list → deletes all its cards

---

## Setup Instructions

### Development Setup

```bash
# Install dependencies
$ pnpm install

# Development mode
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

### Docker Deployment

1. Create `.env.deploy` file with required environment variables (see template below)
2. Run with Docker Compose:

```bash
docker compose -f docker-compose.prod.yml --env-file=./.env.deploy up -d --build
```

### Environment Variables Template (.env.deploy)

```bash
# Database Configuration
POSTGRES_DB=your_database_name
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_APP_USER=your_app_user
POSTGRES_APP_PASSWORD=your_secure_app_password
POSTGRES_PORT=5432

# Application Configuration
APP_PORT=3000
JWT_SECRET=your_super_secret_jwt_key

# Environment
NODE_ENV=production
```

### Run Tests

```bash
# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.
