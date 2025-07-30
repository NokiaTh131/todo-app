# Todo App API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
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
**Response:** JWT token for authentication

---

## 👤 User Endpoints

### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

---

## 📋 Board Endpoints

### Create Board
```http
POST /boards
Authorization: Bearer <token>
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
Authorization: Bearer <token>
```

### Get Single Board
```http
GET /boards/:id
Authorization: Bearer <token>
```

### Update Board
```http
PATCH /boards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string" (optional),
  "description": "string" (optional),
  "background_color": "string" (optional)
}
```

### Delete Board
```http
DELETE /boards/:id
Authorization: Bearer <token>
```
**Response:** `{ "message": "Board removed successfully" }`

---

## 📝 List Endpoints

### Create List in Board
```http
POST /lists/board/:boardId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "position": "number" (optional, auto-assigns if not provided)
}
```

### Get Lists for Board
```http
GET /lists/board/:boardId
Authorization: Bearer <token>
```
**Response:** Lists ordered by position (ascending) with their cards

### Get Single List
```http
GET /lists/:id
Authorization: Bearer <token>
```
**Response:** List with its cards

### Update List
```http
PATCH /lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string" (optional),
  "position": "number" (optional)
}
```

### Delete List
```http
DELETE /lists/:id
Authorization: Bearer <token>
```
**Response:** `{ "message": "List removed successfully" }`

---

## 🎯 Card Endpoints

### Create Card in List
```http
POST /cards/list/:listId
Authorization: Bearer <token>
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
Authorization: Bearer <token>
```
**Response:** Cards ordered by position (ascending)

### Get Single Card
```http
GET /cards/:id
Authorization: Bearer <token>
```

### Update Card
```http
PATCH /cards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string" (optional),
  "description": "string" (optional),
  "position": "number" (optional),
  "due_date": "string" (optional, ISO date format),
  "cover_color": "string" (optional)
}
```

### Move Card to Different List
```http
PUT /cards/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "newListId": "string",
  "newPosition": "number" (optional, moves to end if not provided)
}
```

### Delete Card
```http
DELETE /cards/:id
Authorization: Bearer <token>
```
**Response:** `{ "message": "Card removed successfully" }`

---

## 📊 Data Models

### User
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Board
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "background_color": "string",
  "user_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### List
```json
{
  "id": "uuid",
  "name": "string",
  "position": "number",
  "board_id": "uuid",
  "created_at": "timestamp",
  "cards": "Card[]" (when included)
}
```

### Card
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "position": "number",
  "due_date": "timestamp",
  "cover_color": "string",
  "list_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## ⚠️ Important Notes

### Position Management
- **Unique Constraints:** Each list must have unique position within a board, each card must have unique position within a list
- **Auto-positioning:** If position not provided, items are added to the end
- **Manual positioning:** If position is provided, it must be unique or will result in constraint error
- **Frontend Responsibility:** Frontend should handle position reordering and gap management

### Error Responses
- **400:** Bad Request (validation errors)
- **401:** Unauthorized (missing/invalid token)
- **404:** Not Found (resource doesn't exist)
- **500:** Internal Server Error (database/server errors)

### Date Format
Use ISO 8601 format for dates: `"2024-12-31T23:59:59.000Z"`

### Cascade Deletes
- Deleting a user → deletes all their boards → deletes all lists → deletes all cards
- Deleting a board → deletes all its lists → deletes all cards in those lists
- Deleting a list → deletes all its cards

---

## Setup Instructions

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

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

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
