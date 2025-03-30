import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import type { Application } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Server } from 'node:http';
import type { UserCreateInput } from './graphql-types';
import { createUser, getUsers, userResolver } from './user/user.resolver';
import { postResolver } from './posts/post.resolver';
import { commentResolver } from './comments/comment.resolver';

// const dbPosts = [
//     {
//         id: 1,
//         title: "Post 1",
//         content: "Content of Post 1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 1,
//     },
//     {
//         id: 2,
//         title: "Post 2",
//         content: "Content of Post 2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 2,
//     },
//     {
//         id: 3,
//         title: "Post 3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         content: "Content of Post 3",
//         userId: 1,
//     },
//     {
//         id: 4,
//         title: "Post 4",
//         content: "Content of Post 4",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 2,
//     },
//     {
//         id: 5,
//         title: "Post 5",
//         content: "Content of Post 5",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 3,
//     },
//     {
//         id: 6,
//         title: "Post 6",
//         content: "Content of Post 6",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 4,
//     },
//     {
//         id: 7,
//         title: "Post 7",
//         content: "Content of Post 7",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         userId: 5,
//     }
// ];

// const dbUsers: User[] = [
//     {
//         id: '1',
//         name: "User 1",
//         email: 'user1@example.com',
//         displayName: "user_1",
//         avatar: "https://example.com/user_1.jpg",
//         role: Role.Admin,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//     },
//     {
//         id: '2',
//         name: "User 2",
//         displayName: "user_2",
//         avatar: "https://example.com/user_2.jpg",
//         role: Role.User,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         email: 'user2@e.com'
//     },
//     {
//         id: '3',
//         name: "User 3",
//         displayName: "user_3",
//         avatar: "https://example.com/user_3.jpg",
//         role: Role.User,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         email: 'user3@e.com'
//     },
//     {
//         id: '4',
//         name: "User 4",
//         displayName: "user_4",
//         avatar: "https://example.com/user_4.jpg",
//         role: Role.User,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         email: 'user4@e.com'
//     },
//     {
//         id: '5',
//         name: "User 5",
//         displayName: "user_5",
//         avatar: "https://example.com/user_5.jpg",
//         role: Role.User,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         email: 'user5@e.com'
//     }

// ];

// const comments = [
//     {
//         id: 1,
//         content: "Comment 1",
//         postId: 1,
//         userId: 1,
//         replyTo: null,
//     },
//     {
//         id: 2,
//         content: "Comment 2",
//         postId: 2,
//         userId: 2,
//         replyTo: null,
//     },
//     {
//         id: 3,
//         content: "Comment 3",
//         postId: 3,
//         userId: 1,
//         replyTo: null,
//     },
//     {
//         id: 4,
//         content: "Comment 4",
//         postId: 4,
//         userId: 2,
//         replyTo: null,
//     },
//     {
//         id: 5,
//         content: "Comment 5",
//         postId: 5,
//         userId: 3,
//         replyTo: null,
//     },
//     {
//         id: 6,
//         content: "Comment 6",
//         postId: 6,
//         userId: 4,
//         replyTo: null,
//     },
//     {
//         id: 7,
//         content: "Comment 7",
//         postId: 7,
//         userId: 5,
//         replyTo: null,
//     }
// ];

export async function registerGraphQLServer(app: Application, httpServer: Server) {
	interface MyContext {
		token?: string;
	}

    // ./src/schema.graphql
    const filePath = path.join(__dirname, 'schema.graphql');
    const typeDefs = await readFile(filePath, 'utf-8');
    const gqlServer = new ApolloServer<MyContext>({
        typeDefs,
        resolvers: {
            Query: {
                users: (_, { size, page }: { page: number, size: number }) => getUsers(page, size),
                posts: (_, { page, size }) => postResolver.getPosts(page, size),
                comments: () => commentResolver.getComments(1, 10),
                user: (_, { id }) => userResolver.getUserById(id),
                post: (_, { id }) => postResolver.getPostsById(id),
            },
            Mutation: {
                createUser: (_, { user }: { user: UserCreateInput }) => createUser(user)
            },
            User: {
                posts: (parent) => postResolver.getPostsByUserId(parent.id),
                comments: (parent) => commentResolver.getCommentsByUserId(parent.id),
            },
            Post: {
                comments: (parent) => commentResolver.getCommentsByPostId(parent.id),
                user: (parent) => userResolver.getUserById(parent.userId),
            },
            Comment: {
                user: (parent) => userResolver.getUserById(parent.userId),
                post: (parent) => postResolver.getPostsById(parent.postId),
                replyTo: (parent) => commentResolver.getCommentsById(parent.replyTo)
            }
        },
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await gqlServer.start();
	app.use(
		"/graphql",
		expressMiddleware(gqlServer, {
			context: async ({ req }) => ({ token: req.headers.token }),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		}) as unknown as any,
	);
}