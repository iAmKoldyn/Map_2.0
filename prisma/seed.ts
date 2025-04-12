import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    },
  });

  // Create test places
  const places = await Promise.all([
    prisma.place.create({
      data: {
        name: 'Eiffel Tower',
        description: 'Iconic iron tower in Paris',
        latitude: 48.8584,
        longitude: 2.2945,
        address: 'Champ de Mars, 5 Avenue Anatole France',
        city: 'Paris',
        country: 'France',
        category: 'attraction',
        imageUrl: 'https://example.com/eiffel.jpg',
        website: 'https://www.toureiffel.paris',
        phone: '+33144112323',
        email: 'info@toureiffel.paris',
      },
    }),
    prisma.place.create({
      data: {
        name: 'Louvre Museum',
        description: 'World\'s largest art museum',
        latitude: 48.8606,
        longitude: 2.3376,
        address: 'Rue de Rivoli',
        city: 'Paris',
        country: 'France',
        category: 'museum',
        imageUrl: 'https://example.com/louvre.jpg',
        website: 'https://www.louvre.fr',
        phone: '+33140205050',
        email: 'info@louvre.fr',
      },
    }),
  ]);

  // Create test taxis
  const taxis = await Promise.all([
    prisma.taxi.create({
      data: {
        name: 'Paris Taxi Service',
        phone: '+33123456789',
        company: 'Paris Taxi Co.',
        rating: 4.5,
        isAvailable: true,
        places: {
          connect: places.map(place => ({ id: place.id })),
        },
      },
    }),
    prisma.taxi.create({
      data: {
        name: 'Quick Taxi',
        phone: '+33198765432',
        company: 'Quick Taxi Services',
        rating: 4.2,
        isAvailable: true,
        places: {
          connect: places.map(place => ({ id: place.id })),
        },
      },
    }),
  ]);

  // Create test reviews
  await Promise.all([
    prisma.review.create({
      data: {
        content: 'Amazing place! Must visit!',
        rating: 5,
        author: 'John Doe',
        placeId: places[0].id,
        userId: testUser.id,
      },
    }),
    prisma.review.create({
      data: {
        content: 'Beautiful museum with great collections',
        rating: 4,
        author: 'Jane Smith',
        placeId: places[1].id,
        userId: testUser.id,
      },
    }),
  ]);

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
  ]);

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 