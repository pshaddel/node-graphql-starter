import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import type { Application } from 'express';
import { typeDefs, type User, type UserCreateInput } from './schema';
import type { Server } from 'node:http';

const posts = [
    {
        id: 1,
        title: "Post 1",
        content: "Content of Post 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 2,
        title: "Post 2",
        content: "Content of Post 2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 2,
    },
    {
        id: 3,
        title: "Post 3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: "Content of Post 3",
        userId: 1,
    },
    {
        id: 4,
        title: "Post 4",
        content: "Content of Post 4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 2,
    },
    {
        id: 5,
        title: "Post 5",
        content: "Content of Post 5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 3,
    },
    {
        id: 6,
        title: "Post 6",
        content: "Content of Post 6",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 4,
    },
    {
        id: 7,
        title: "Post 7",
        content: "Content of Post 7",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 5,
    }
];

const dbUsers: User[] = [
    {
        id: 1,
        name: "User 1",
        email: 'user1@example.com',
        displayName: "user_1",
        avatar: "https://example.com/user_1.jpg",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        name: "User 2",
        displayName: "user_2",
        avatar: "https://example.com/user_2.jpg",
        role: "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'user2@e.com'
    },
    {
        id: 3,
        name: "User 3",
        displayName: "user_3",
        avatar: "https://example.com/user_3.jpg",
        role: "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'user3@e.com'
    },
    {
        id: 4,
        name: "User 4",
        displayName: "user_4",
        avatar: "https://example.com/user_4.jpg",
        role: "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'user4@e.com'
    },
    {
        id: 5,
        name: "User 5",
        displayName: "user_5",
        avatar: "https://example.com/user_5.jpg",
        role: "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'user5@e.com'
    }

];

const comments = [
    {
        id: 1,
        content: "Comment 1",
        postId: 1,
        userId: 1,
        replyTo: null,
    },
    {
        id: 2,
        content: "Comment 2",
        postId: 2,
        userId: 2,
        replyTo: null,
    },
    {
        id: 3,
        content: "Comment 3",
        postId: 3,
        userId: 1,
        replyTo: null,
    },
    {
        id: 4,
        content: "Comment 4",
        postId: 4,
        userId: 2,
        replyTo: null,
    },
    {
        id: 5,
        content: "Comment 5",
        postId: 5,
        userId: 3,
        replyTo: null,
    },
    {
        id: 6,
        content: "Comment 6",
        postId: 6,
        userId: 4,
        replyTo: null,
    },
    {
        id: 7,
        content: "Comment 7",
        postId: 7,
        userId: 5,
        replyTo: null,
    }
];

export async function registerGraphQLServer(app: Application, httpServer: Server) {
	interface MyContext {
		token?: string;
	}

	const gqlServer = new ApolloServer<MyContext>({
		typeDefs,
		resolvers: {
			Query: {
				hello: () => "Hello world!",
                users: (_, { size, page }) => {
                    if (size > 10) size = 10;
                    if (page < 1) page = 1;
                    const start = (page - 1) * size;
                    const end = start + size;
                    console.log('usersFunc executed'); return dbUsers.slice(start, end);
                },
                posts: () => { console.log('postsFunc executed'); return posts },
                comments: () => { console.log('commentsFunc executed'); return comments },
                user: (_, { id }) => { console.log('singleUserFetched executed'); return dbUsers.find(user => user.id === id) },
                post: (_, { id }) => { console.log('singlePostFetched executed'); return posts.find(post => post.id === id) },
			},
            Mutation: {
                createUser: (_, { user }: { user: UserCreateInput }) => {
                    console.log('createUser executed');
                    const newUser: User = {
                        id: dbUsers.length + 1,
                        ...user,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    dbUsers.push(newUser);
                    return newUser;
                }
            },
            User: {
                posts: (parent) => {
                    console.log('userPosts executed');
                    return posts.filter(post => post.userId === parent.id);
                },
                comments: (parent) => {
                    console.log('userComments executed');
                    return comments.filter(comment => comment.userId === parent.id);
                }
            },
            Post: {
                comments: (parent) => {
                    console.log('postComments executed');
                    return comments.filter(comment => comment.postId === parent.id);
                },
                user: (parent) => {
                    console.log('postUser executed');
                    return dbUsers.find(user => user.id === parent.userId);
                }
            },
            Comment: {
                user: (parent) => {
                    console.log('commentUser executed');
                    return dbUsers.find(user => user.id === parent.userId);
                },
                post: (parent) => {
                    console.log('commentPost executed');
                    return posts.find(post => post.id === parent.postId);
                },
                replyTo: (parent) => {
                    console.log('commentReplyTo executed');
                    return comments.find(comment => comment.id === parent.replyTo);
                }
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