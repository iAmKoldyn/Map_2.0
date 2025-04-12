# Travel Service Backend

A backend service for travel applications using Express, tRPC, and Prisma.

## Features

- RESTful API with tRPC
- PostgreSQL database with Prisma ORM
- Docker containerization
- JWT authentication
- Role-based access control
- Rate limiting
- CORS support

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-service-backend.git
cd travel-service-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the services:
```bash
docker compose up -d
```

5. Run database migrations:
```bash
docker compose exec backend npx prisma migrate deploy
```

## API Documentation

### Authentication

- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/refresh` - Refresh token

### Places

- GET `/trpc/place.getAll` - Get all places
- GET `/trpc/place.getById` - Get place by ID
- POST `/trpc/place.create` - Create new place (Admin only)
- PUT `/trpc/place.update` - Update place (Admin only)
- DELETE `/trpc/place.delete` - Delete place (Admin only)

### Taxis

- GET `/trpc/taxi.getAll` - Get all taxis
- GET `/trpc/taxi.getById` - Get taxi by ID
- POST `/trpc/taxi.create` - Create new taxi (Admin only)
- PUT `/trpc/taxi.update` - Update taxi (Admin only)
- DELETE `/trpc/taxi.delete` - Delete taxi (Admin only)

### Reviews

- GET `/trpc/review.getAll` - Get all reviews
- GET `/trpc/review.getById` - Get review by ID
- POST `/trpc/review.create` - Create new review (Authenticated users)
- PUT `/trpc/review.update` - Update review (Admin only)
- DELETE `/trpc/review.delete` - Delete review (Admin only)

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT 