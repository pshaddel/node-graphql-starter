const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create 100 users
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        displayName: faker.internet.username(),
        avatar: faker.image.avatar(),
        role: faker.helpers.arrayElement(['ADMIN', 'USER', 'SUPPORT_USER']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });

    // Create 1 to 20 posts for each user
    const postCount = faker.number.int({ min: 1, max: 20 });
    const posts = [];
    for (let j = 0; j < postCount; j++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          userId: user.id,
        },
      });
      posts.push(post);
    }

    // Create at least 20 comments for each user under random posts
    for (let k = 0; k < 20; k++) {
      const randomPost = faker.helpers.arrayElement(posts);
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          postId: randomPost.id,
          userId: user.id,
        },
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });