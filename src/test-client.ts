import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://backend:3000/trpc',
    }),
  ],
});

async function testPlaces() {
  try {
    console.log('\n=== Testing Places ===');
    
    // Create a place
    const createdPlace = await client.place.create.mutate({
      name: "Central Park",
      description: "Famous urban park in NYC",
      latitude: 40.7829,
      longitude: -73.9654
    });
    console.log('Created place:', createdPlace);

    // Get all places
    const allPlaces = await client.place.getAll.query();
    console.log('All places:', allPlaces);

    // Get place by ID
    const placeById = await client.place.getById.query({ id: createdPlace.id });
    console.log('Place by ID:', placeById);

  } catch (error) {
    console.error('Error testing places:', error);
  }
}

async function testTaxis() {
  try {
    console.log('\n=== Testing Taxis ===');
    
    // Create a taxi
    const createdTaxi = await client.taxi.create.mutate({
      name: "Yellow Cab",
      phone: "+1234567890",
      places: {
        connect: [{ id: 1 }] // Connect to place with ID 1
      }
    });
    console.log('Created taxi:', createdTaxi);

    // Get all taxis
    const allTaxis = await client.taxi.getAll.query();
    console.log('All taxis:', allTaxis);

    // Get taxi by ID
    const taxiById = await client.taxi.getById.query({ id: createdTaxi.id });
    console.log('Taxi by ID:', taxiById);

  } catch (error) {
    console.error('Error testing taxis:', error);
  }
}

async function testReviews() {
  try {
    console.log('\n=== Testing Reviews ===');
    
    // Create a review
    const createdReview = await client.review.create.mutate({
      placeId: 1, // Assuming place with ID 1 exists
      rating: 5,
      content: "Great place to visit!"
    });
    console.log('Created review:', createdReview);

    // Get all reviews
    const allReviews = await client.review.getAll.query();
    console.log('All reviews:', allReviews);

    // Get review by ID
    const reviewById = await client.review.getById.query({ id: createdReview.id });
    console.log('Review by ID:', reviewById);

  } catch (error) {
    console.error('Error testing reviews:', error);
  }
}

async function main() {
  try {
    await testPlaces();
    await testTaxis();
    await testReviews();
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main(); 