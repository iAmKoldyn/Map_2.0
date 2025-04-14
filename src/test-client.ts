import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers';
import { ReviewSchema } from './utils/zodSchemas';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

async function main() {
  try {
    // Test place operations
    console.log('Creating a new place...');
    const newPlace = await client.place.create.mutate({
      name: 'Test Place',
      description: 'A test place',
      latitude: 40.7128,
      longitude: -74.006,
    });
    console.log('Created place:', newPlace);

    // Test getById with proper number conversion
    console.log('Getting place by ID...');
    const placeById = await client.place.getById.query({ id: Number(newPlace.id) });
    console.log('Place by ID:', placeById);

    // Test taxi operations
    console.log('Creating a new taxi...');
    const newTaxi = await client.taxi.create.mutate({
      name: 'Test Taxi',
      phone: '+1234567890',
      company: 'Test Company',
      isAvailable: true,
      places: {
        connect: [{ id: Number(newPlace.id) }],
      },
    });
    console.log('Created taxi:', newTaxi);

    // Test review operations
    console.log('Creating a new review...');
    const userId = 1; // Assuming user ID 1 exists
    const newReview = await client.review.create.mutate({
      placeId: Number(newPlace.id),
      userId: Number(userId),
      rating: 5,
      content: 'Great place!',
      author: 'Test User',
    });
    console.log('Created review:', newReview);

    // Test getById operations with proper number conversion
    console.log('Getting taxi by ID...');
    const taxiById = await client.taxi.getById.query({ id: Number(newTaxi.id) });
    console.log('Taxi by ID:', taxiById);

    console.log('Getting review by ID...');
    const reviewById = await client.review.getById.query({ id: Number(newReview.id) });
    console.log('Review by ID:', reviewById);

    // Test getByPlace operations
    console.log('Getting reviews by place...');
    const reviewsByPlace = await client.review.getByPlace.query({ placeId: Number(newPlace.id) });
    console.log('Reviews by place:', reviewsByPlace);

    // Test average rating
    console.log('Getting average rating...');
    const avgRating = await client.review.getAverageRating.query({ placeId: Number(newPlace.id) });
    console.log('Average rating:', avgRating);
  } catch (error) {
    console.error('Error in test client:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

main().catch(console.error);
