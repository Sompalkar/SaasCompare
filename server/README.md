# CompareV2 Server

This is the backend server for the CompareV2 application, a platform for comparing SaaS tools and cloud providers.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables by creating a `.env` file in the root directory with the following:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/compare_v2"
   JWT_SECRET="your-jwt-secret"
   PORT=8000
   ```

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Seeding

The application includes database seeding scripts to populate your database with initial data:

### Using the CLI

To seed the database with SaaS tools and cloud providers:

```bash
# Seed SaaS tools
npm run seed

# Force override existing SaaS tool data
npm run seed:force
```

### Using the API Endpoints

You can also trigger the seeding process through API endpoints (admin access required):

```bash
# Seed SaaS tools
curl -X POST http://localhost:8000/api/admin/seed

# Seed cloud providers and services
curl -X POST http://localhost:8000/api/admin/seed-cloud
```

## Data Types

The seeding process populates two main types of data:

1. **SaaS Tools** - Software-as-a-Service applications with pricing plans, features, and integrations
2. **Cloud Providers** - Cloud computing providers (AWS, Azure, GCP, etc.) with their service offerings

## API Documentation

The server exposes the following main API endpoints:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/tools` - SaaS tools data
- `/api/compare` - Tool comparison functionality
- `/api/admin` - Admin-only endpoints
- `/api/reports` - Report generation
- `/api/cloud-providers` - Cloud provider services

For a full API documentation, refer to the Swagger documentation available at `/api/docs` when running the server.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run seed` - Run the SaaS tools seeding script
- `npm run seed:force` - Force override existing SaaS tools data
