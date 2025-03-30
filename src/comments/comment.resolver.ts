import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getComments(page: number, size: number) {
    const comments = await prisma.comment.findMany({
        skip: (page - 1) * size,
        take: size,
    });
    prisma.$disconnect();
    return comments;
}

async function getCommentsById(id: number) {
    const comment = await prisma.comment.findUnique({
        where: { id: id.toString() },
    });
    prisma.$disconnect();
    return comment;
}

async function getCommentsByUserId(userId: number) {
    const comments = await prisma.comment.findMany({
        where: { userId: userId.toString() },
    });
    prisma.$disconnect();
    return comments;
}

async function getCommentsByPostId(postId: number) {
    const comments = await prisma.comment.findMany({
        where: { postId: postId.toString() },
    });
    prisma.$disconnect();
    return comments;
}


// async function createPost(post: PostCreationObject) {
//     const insertResult = await prisma.post.create({
//         data: post,
//     });
//     prisma.$disconnect();
//     return insertResult;
// }

export const commentResolver = {
    getComments,
    getCommentsById,
    getCommentsByUserId,
    getCommentsByPostId,
    // createPost,
}