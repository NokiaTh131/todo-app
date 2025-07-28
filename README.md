# Todo App Monorepo

## Overview
Simple Trello-like kanban board application where users can access their personal boards, create lists, manage cards, and handle checklist items within cards.

## Project Structure
```
├── backend/     # NestJS API server
└── frontend/    # Frontend application
```

## Backend (NestJS)
**Location:** `backend/`

### Setup
```bash
cd backend
pnpm install
```

### Development
```bash
pnpm start:dev    # Start with hot reload
pnpm start:debug  # Start with debugger
```

### Production
```bash
pnpm build
pnpm start:prod
```

### Testing
```bash
pnpm test         # Unit tests
pnpm test:e2e     # E2E tests
pnpm test:cov     # Coverage report
```

### Code Quality
```bash
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Frontend
**Location:** `frontend/`

*Frontend setup instructions to be added*

## Development Workflow

1. **Backend Development:**
   - Navigate to `backend/`
   - Install dependencies: `pnpm install`
   - Start dev server: `pnpm start:dev`
   - API runs on default NestJS port

2. **Frontend Development:**
   - Navigate to `frontend/`
   - Follow frontend-specific setup

## Database
Backend uses TypeORM with PostgreSQL. Configure connection in backend environment variables.