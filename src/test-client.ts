import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from './routers';
import { UserRole } from './middleware/authMiddleware';

let authToken = '';
let userId: number;

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      headers: () => ({
        Authorization: authToken ? `Bearer ${authToken}` : '',
      }),
    }),
  ],
});

async function main() {
  try {
    // Try to login first
    try {
      console.log('Attempting to login as admin...');
      const loginResponse = await client.auth.login.mutate({
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('Successfully logged in as admin:', loginResponse.user);
      authToken = loginResponse.token;
      userId = loginResponse.user.id;
    } catch (error) {
      // If login fails, try to register
      console.log('Login failed, attempting to register admin...');
      const registerResponse = await client.auth.register.mutate({
        email: 'admin@example.com',
        password: 'admin123',
        role: UserRole.ADMIN
      });
      console.log('Successfully registered admin:', registerResponse.user);
      authToken = registerResponse.token;
      userId = registerResponse.user.id;
    }

    // Test places
    console.log('Testing places...');
    const newPlace = await client.place.create.mutate({
      name: 'Central Park',
      description: 'A beautiful park in the heart of New York City',
      latitude: 40.7829,
      longitude: -73.9654
    });
    console.log('Created place:', newPlace);

    const places = await client.place.getAll.query();
    console.log('All places:', places);

    const placeById = await client.place.getById.query(newPlace.id);
    console.log('Place by ID:', placeById);

    // Test taxis
    console.log('\nTesting taxis...');
    const newTaxi = await client.taxi.create.mutate({
      name: 'Yellow Cab',
      phone: '555-0123',
      company: 'NYC Taxis',
      places: {
        connect: [{ id: newPlace.id }]
      }
    });
    console.log('Created taxi:', newTaxi);

    const taxis = await client.taxi.getAll.query();
    console.log('All taxis:', taxis);

    const taxiById = await client.taxi.getById.query(newTaxi.id);
    console.log('Taxi by ID:', taxiById);

    // Test reviews
    console.log('\nTesting reviews...');
    const newReview = await client.review.create.mutate({
      content: 'Beautiful place!',
      rating: 5,
      placeId: newPlace.id,
      userId: userId
    });
    console.log('Created review:', newReview);

    const reviews = await client.review.getAll.query();
    console.log('All reviews:', reviews);

    const reviewById = await client.review.getById.query(newReview.id);
    console.log('Review by ID:', reviewById);

    const placeReviews = await client.review.getByPlace.query(newPlace.id);
    console.log('Reviews for place:', placeReviews);

    const avgRating = await client.review.getAverageRating.query({ placeId: newPlace.id });
    console.log('Average rating:', avgRating);

  } catch (error) {
    console.error('Error in test client:', error);
    process.exit(1);
  }
}

main(); 