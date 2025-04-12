#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h localhost -p 5432 -U postgres; do
  sleep 1
done

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -h localhost -p 5432 -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'map_db'" | grep -q 1 || psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE map_db"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Database initialization complete!" 