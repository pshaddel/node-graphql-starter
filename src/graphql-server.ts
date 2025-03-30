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

export async function registerGraphQLServer(app: Application, httpServer: Server) {
	interface MyContext {
		token?: string;
    }
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