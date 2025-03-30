import { PrismaClient } from "@prisma/client";

async function getPosts(page: number, size: number) {
    const prisma = new PrismaClient();
    const posts = await prisma.post.findMany({
        skip: (page - 1) * size,
        take: size,
    });
    prisma.$disconnect();
    return posts;
}

async function getPostsById(id: number) {
    const prisma = new PrismaClient();
    const post = await prisma.post.findUnique({
        where: { id: id.toString() },
    });
    prisma.$disconnect();
    return post;
}

async function getPostsByUserId(userId: number) {
    const prisma = new PrismaClient();
    const posts = await prisma.post.findMany({
        where: { userId: userId.toString() },
    });
    prisma.$disconnect();
    return posts;
}

export const postResolver = {
    getPosts,
    getPostsById,
    getPostsByUserId,
}